# Node.js 이벤트 루프 / 비동기 실행 순서

## 1. 문제 정의 및 실무 맥락
- Node.js는 기본적으로 **싱글 스레드**로 동작해. 그런데도 수천 개의 동시 요청을 처리할 수 있는 이유가 "이벤트 루프" 구조 때문이야.
- 실무 버그 예시: Express/Next.js API 핸들러 안에서 무거운 동기 연산(예: 큰 배열 정렬, 암호화 연산을 `await` 없이 동기로 처리)을 돌리면, 그 순간 **이벤트 루프 전체가 막혀서** 다른 모든 요청이 응답을 못 받고 대기하게 돼. "가끔 서버가 멈춘 것처럼 느려진다"는 증상의 흔한 원인.
- 비동기 코드의 실행 순서(동기 코드 → microtask → macrotask)를 정확히 모르면, "분명 순서대로 짰는데 왜 이 순서로 실행되지?" 같은 디버깅에서 계속 헤매게 됨. `setTimeout(fn, 0)`이 "즉시 실행"이 아니라는 걸 모르고 짠 코드가 실무에서 실제로 버그를 일으키는 경우도 흔함.
- Express/Next.js 같은 프레임워크의 미들웨어 체인, 요청 처리 순서를 이해하는 기반이 되는 개념이기도 함.
- 면접 단골 질문: `setTimeout`, `Promise.then`, `process.nextTick`, 동기 코드가 섞인 코드를 주고 "실행 순서를 맞혀보라"는 형태로 자주 출제됨.

## 2. 구현 요구사항
이번 주제는 자료구조처럼 "직접 구현"하는 게 아니라, **실행 순서를 예측하고 왜 그런지 근거를 설명하는 방식**으로 진행할게.

아래 코드를 보고, `console.log`가 찍히는 **순서**를 예측해봐. 그리고 각 줄이 왜 그 순서에 실행되는지 (동기 코드인지, microtask인지, macrotask인지) 이유도 같이 적어줘.

```typescript
console.log("1: 시작");

setTimeout(() => {
  console.log("2: setTimeout");
}, 0);

Promise.resolve().then(() => {
  console.log("3: Promise.then");
});

process.nextTick(() => {
  console.log("4: process.nextTick");
});

console.log("5: 끝");
```

**요구사항**
- 최종 출력 순서(숫자 나열)를 먼저 적기
- 각 줄이 "동기 / microtask / macrotask" 중 어디에 속하는지 분류
- `process.nextTick`과 `Promise.then`이 둘 다 microtask 계열인데, 왜 둘 사이에도 순서 차이가 나는지 네 나름대로 추측해봐도 좋음

## 3. 내가 작성한 코드
**최종 출력 순서 (정답): `1 - 5 - 4 - 3 - 2`**

- `1`, `5` → 동기 코드 (콜스택에서 즉시 실행)
- `4` (`process.nextTick`) → nextTick 큐
- `3` (`Promise.then`) → 마이크로태스크(Promise) 큐
- `2` (`setTimeout`) → 매크로태스크 (Timers 페이즈)

## 4. 코드 리뷰 피드백

1. **(1차 시도) 순서 오답, 분류는 정답** — 처음엔 `1-5-2-4-3`로, 동기/microtask/macrotask 분류(2=macro, 3·4=micro)는 맞았지만 "microtask는 다음 macrotask보다 항상 먼저 전부 처리된다"는 규칙을 순서에 반영하지 못했음. → 규칙을 다시 적용해 `1-5-4-3-2`로 스스로 수정.
2. **(nextTick vs Promise 순서 이유)** Node.js는 `process.nextTick()` 전용의 **nextTick 큐**와 `.then()`/`async-await`용 **마이크로태스크(Promise) 큐**를 별도로 운영하고, 매 동기 코드/콜백이 끝날 때마다 nextTick 큐를 먼저 통째로 비운 뒤 마이크로태스크 큐를 비움. 이건 브라우저 표준 이벤트 루프에는 없는 **Node.js 고유의 구현**.

## 5. 꼬리질문과 답변

### 1. `process.nextTick()` 안에서 다시 `process.nextTick()`을 재귀적으로 호출하면 서버에 어떤 문제가 생길까?

- **답변**: 다른 요청 처리가 후순위로 밀리면서 대기하다가 결국 처리되지 못하는 문제가 생길 것 같다.
- **피드백**: 핵심(다른 요청이 영원히 밀린다)은 정확함. 다만 "서버가 터진다(크래시)"는 표현은 부정확 — 실제로는 에러 없이 CPU만 계속 쓰면서 모든 요청에 응답 못 하고 완전히 멈추는 **hang(응답 불능) 상태**가 됨. nextTick 큐가 절대 안 비워져서 이벤트 루프가 다음 단계(타이머, I/O 콜백 등)로 영원히 못 넘어가기 때문. Node 공식 문서에도 "`process.nextTick` 재귀 호출은 I/O를 굶주리게(starve) 한다"고 명시된 안티패턴.

### 2. `async function foo() { await Promise.resolve(); console.log("after await"); }`에서 `await` 뒤의 코드는 nextTick 큐와 마이크로태스크 큐 중 어느 쪽에 가깝게 동작할까?

- **답변**: nextTick 큐에 가깝게 동작할 것 같다. await 뒤에 오는 코드는 결과를 항상 기다리기 때문.
- **피드백(정정)**: 오답. `await` 이후 코드는 **마이크로태스크(Promise) 큐**에 들어감. `async/await`는 Promise 체이닝(`.then()`)을 문법적으로 편하게 쓰는 **문법 설탕**이라서, `await x`는 내부적으로 `Promise.resolve(x).then(continuation)`과 거의 같게 동작함 — 그래서 이어지는 코드가 `.then()` 콜백과 같은 큐에 들어감. "결과를 기다린다"는 느낌 때문에 nextTick처럼 특별 취급될 것 같지만, 큐 배정 기준은 "기다림의 유무"가 아니라 "Promise 메커니즘을 쓰느냐"임. 그래서 `process.nextTick`과 `await` 이후 코드가 같이 있으면 `process.nextTick`이 항상 먼저 실행됨(서로 다른 큐이고 nextTick 큐가 우선순위 높음).

## 6. 면접용 설명 요약
> Node.js는 싱글 스레드로 동작하지만 이벤트 루프 덕분에 많은 요청을 동시에 처리할 수 있습니다. 다만 API 핸들러 안에서 무거운 동기 연산을 돌리면 이벤트 루프 자체가 막혀서 다른 모든 요청이 지연되는 문제가 생길 수 있기 때문에, 실무에서는 비동기 코드가 정확히 어떤 순서로 실행되는지 아는 게 중요합니다.
>
> 실행 순서는 크게 네 단계로 나뉩니다. 먼저 동기 코드가 콜스택에서 순서대로 실행되고, 그게 끝나면 `process.nextTick()`으로 등록한 콜백들이 담긴 **nextTick 큐**를 통째로 비웁니다. 그다음 `.then()`이나 `async/await` 이후 코드가 담기는 **마이크로태스크(Promise) 큐**를 비우고, 마지막에야 `setTimeout` 같은 **매크로태스크**로 넘어갑니다. 핵심 규칙은 "다음 매크로태스크로 넘어가기 전에 마이크로태스크 큐는 항상 전부 비워진다"는 것입니다.
>
> 직접 실행 순서를 예측해보면서 헷갈렸던 부분은, `async/await`가 결국 Promise 체이닝의 문법 설탕이라서 `await` 이후 코드도 nextTick이 아니라 Promise와 같은 마이크로태스크 큐에 들어간다는 점이었습니다. 또, `process.nextTick`을 재귀적으로 계속 호출하면 nextTick 큐가 절대 안 비워져서 이벤트 루프가 다음 단계로 넘어가지 못하고, 서버가 크래시 나는 게 아니라 응답 불능 상태로 멈춰버리는 "starvation" 문제가 생길 수 있다는 것도 배웠습니다.
