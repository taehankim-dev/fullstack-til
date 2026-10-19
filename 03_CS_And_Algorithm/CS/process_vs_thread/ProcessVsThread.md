# 프로세스 vs 스레드, Node.js Worker Threads/Cluster

## 1. 문제 정의 및 실무 맥락
- 지난 이벤트 루프 세션에서 "API 핸들러 안에서 무거운 동기 연산을 돌리면 이벤트 루프가 막혀서 다른 요청이 지연된다"는 문제를 이야기했었음. 근데 그걸 실제로 어떻게 해결하는지는 안 다뤘음 — 오늘이 그 해결책.
- Node.js는 JS 코드 자체를 싱글 스레드(이벤트 루프)로 실행하지만, 서버는 보통 멀티코어 CPU를 가지고 있음. 싱글 스레드만 쓰면 나머지 코어는 그냥 놀고 있는 자원.
- **프로세스 vs 스레드**: 프로세스는 자기만의 독립된 메모리 공간을 가진 실행 단위(무겁지만 안전하게 분리됨). 스레드는 같은 프로세스 안에서 메모리를 공유하는 더 가벼운 실행 단위(가볍지만 공유 때문에 조심해야 함).
- Node.js가 멀티코어를 활용하는 대표적인 두 가지 방법:
  - **Cluster**: 같은 Node 프로세스를 여러 개 포크(fork)해서, 각 프로세스가 독립적으로 요청을 처리. 프로세스끼리 메모리를 공유하지 않음. "매장을 여러 개 차려서 손님을 분산 받는 것"에 가까움 (PM2의 cluster 모드가 바로 이거 — 이미 써본 경험 있지?)
  - **Worker Threads**: 하나의 프로세스 안에서 별도 스레드를 띄워서, CPU 집약적인 작업(이미지 처리, 암호화, 대량 연산)을 메인 스레드(이벤트 루프)를 막지 않고 처리. "한 매장 안에 주방 보조를 따로 둬서 오래 걸리는 요리를 맡기는 것"에 가까움. 스레드끼리는 기본적으로 메모리를 공유하지 않고(각자 독립된 V8 인스턴스), 메시지를 주고받는 방식(`postMessage`)으로 통신함
- 오늘은 **Worker Threads**를 직접 써서, "메인 스레드를 막는 무거운 연산"을 "따로 떼어내서 처리"하는 걸 실제로 체감해볼 것.

## 2. 구현 요구사항
이번 주제는 "값이 맞는지"보다 "메인 스레드가 실제로 안 막히는지"를 **직접 실행해서 관찰**하는 게 핵심이라, Vitest 테스트 대신 두 개의 스크립트를 직접 실행하는 방식으로 진행할게. (Worker Threads 로더 설정 복잡도를 피하려고 이 폴더는 TypeScript 대신 **순수 JavaScript**로 작성함.)

폴더에 이미 준비해둔 것:
- `heavy-task.js`: 소수 개수를 세는 CPU 집약적 함수 (이미 구현됨, 그대로 사용)
- `main-blocking.js`: "문제 상황"을 보여주는 데모 (이미 구현됨) — 메인 스레드에서 heartbeat를 찍으면서, 동시에 `heavy-task`를 메인 스레드에서 직접 호출함

**네가 구현할 것**
- `worker.js`: `parentPort`로 숫자(`n`)를 받으면, `heavy-task`의 함수로 계산한 뒤 그 결과를 다시 메인 스레드로 보내기
- `main-worker.js`:
  1. `worker.js`를 실행하는 `Worker` 인스턴스 생성
  2. 그 Worker에게 숫자(예: `8_000_000`)를 `postMessage`로 전송
  3. Worker가 보낸 결과를 `'message'` 이벤트로 받아서 콘솔에 출력
  4. 그 와중에도 메인 스레드가 안 멈춘다는 걸 보여주기 위해, `main-blocking.js`처럼 `setInterval`로 heartbeat 로그를 계속 찍기

**실행/관찰 방법** (레포 루트에서)
```bash
node 03_CS_And_Algorithm/CS/process_vs_thread/main-blocking.js
# → heartbeat가 무거운 연산 도중 한동안 멈추는 걸 관찰

node 03_CS_And_Algorithm/CS/process_vs_thread/main-worker.js
# → heartbeat가 멈추지 않고 계속 찍히면서, 결과만 나중에 도착하는 걸 관찰
```

## 3. 내가 작성한 코드
실제 구현은 [worker.js](./worker.js), [main-worker.js](./main-worker.js) 참고. 직접 실행해서 확인:

```
heartbeat
heartbeat
결과 539777
heartbeat
heartbeat
heartbeat
```

`main-blocking.js`에서 봤던 "2초 넘게 heartbeat가 멈추는" 현상이 전혀 없음 — `heavy-task`가 Worker Thread 안에서 실행되는 동안 메인 스레드는 계속 heartbeat를 찍으면서 자유롭게 동작함.

## 4. 코드 리뷰 피드백

**정확함.**
- `worker.js`: `parentPort.on("message", ...)`로 숫자를 받아 계산 후 `postMessage`로 결과 반환 — 정확.
- `main-worker.js`: `Worker` 생성 → `postMessage`로 작업 위임 → `on("message")`로 결과 수신 → 그 와중에 `setInterval` heartbeat — 정확.
- (참고, 버그 아님) `setInterval`이 안 멈춰서 프로세스가 계속 살아있음. 데모 목적이라 문제 없지만, 깨끗하게 종료하고 싶으면 결과 수신 후 `clearInterval` + `worker.terminate()`를 호출하면 됨.

## 5. 꼬리질문과 답변

### 1. Worker Thread 안에서 메인 스레드의 변수를 그냥 참조하면 어떻게 될까?

- **답변**: 메모리가 공유되지 않아서 오류가 나타날 것 같다.
- **정리**: 방향은 맞지만 더 정확히는, 단순 "공유 안 됨" 문제가 아니라 그 변수 자체가 `worker.js` 스코프에 존재하지 않아서 `ReferenceError: counter is not defined`가 발생함. Worker Thread는 메인 스레드와 완전히 별도의 V8 인스턴스(별도의 전역 스코프)로 돌아가기 때문에, "값이 이상하게 공유된다"가 아니라 "그런 변수가 있는지조차 모른다"는 게 정확한 설명. 그래서 `postMessage`로 데이터를 참조가 아니라 복사(structured clone)해서 전달해야 함. (진짜 메모리 공유가 필요하면 `SharedArrayBuffer` + `Atomics`라는 별도 메커니즘이 있음 — 오늘 범위 밖.)

### 2. 실무에서 Cluster와 Worker Thread 중 언제 어떤 걸 선택해야 할까?

- **답변**: Cluster가 여러 요청을 동시에 받는 거고, Worker Thread가 무거운 작업을 메인 스레드에서 떼어내는 것.
- **정리**: 정확함. **Cluster = I/O 바운드(요청 처리량) 확장**, **Worker Thread = CPU 바운드(연산) 격리**로 구분하면 더 선명함.

## 6. 면접용 설명 요약
> Node.js는 JS 코드를 싱글 스레드(이벤트 루프)로 실행하지만, 서버는 멀티코어 CPU를 가지고 있어서 이걸 활용하는 방법이 필요합니다. 대표적으로 Cluster(프로세스를 여러 개 포크해서 요청 처리량을 늘리는 것)와 Worker Threads(한 프로세스 안에서 무거운 연산을 별도 스레드로 떼어내는 것)가 있습니다. 저는 소수 개수를 세는 CPU 집약적 작업을 예시로, 메인 스레드에서 직접 실행했을 때와 Worker Thread로 분리했을 때의 차이를 직접 실행해서 확인해봤습니다.
>
> 메인 스레드에서 직접 실행하면 `setInterval`로 찍던 heartbeat 로그가 연산이 끝날 때까지(약 2초) 완전히 멈췄는데, 같은 작업을 Worker Thread로 옮기니 heartbeat가 한 번도 끊기지 않고 중간에 결과만 도착했습니다. 이 과정에서 중요하게 이해한 점은, Worker Thread가 메인 스레드와 메모리를 공유하지 않는다는 것의 의미였습니다. 이건 단순히 "값이 동기화 안 된다"는 문제가 아니라, Worker가 완전히 별도의 V8 인스턴스(별도의 전역 스코프)로 실행되기 때문에 메인 스레드의 변수를 직접 참조하면 그 변수 자체가 존재하지 않아 `ReferenceError`가 난다는 뜻입니다. 그래서 `postMessage`로 데이터를 참조가 아니라 복사해서 전달해야 합니다.
>
> 마지막으로 Cluster와 Worker Thread의 선택 기준도 정리했습니다. Cluster는 여러 요청을 동시에 받아 처리량을 늘리는 I/O 바운드 확장이고, Worker Thread는 하나의 무거운 연산을 메인 스레드에서 떼어내는 CPU 바운드 격리라서, 상황에 따라 다른 도구를 선택해야 한다는 걸 배웠습니다.
