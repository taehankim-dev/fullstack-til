# 알고리즘 관련 테스트 가이드

## 왜 주제별로 폴더를 나눴나
학습 노트(`.md`), 실제 구현(`.ts`), 테스트(`.test.ts`)를 한 주제당 폴더 하나에 묶어두면, 나중에 특정 주제를 다시 보고 싶을 때 그 폴더 하나만 열면 "무슨 문제였는지 / 어떻게 풀었는지 / 실제로 돌아가는지"가 한 번에 보임. 노트만 따로, 코드만 따로 흩어져 있으면 나중에 다시 찾아보기 귀찮아져서 이렇게 정리함.

```
Algorithm/
  Guide.md                     ← 이 문서 (테스트 방법 + 폴더 구조 설명)
  bfs_dfs/
    BFS_DFS.md                 ← 학습 노트 (문제 정의 → 코드 → 리뷰 → 꼬리질문 → 면접 요약)
  merge_sort/
    Merge_Sort.md               ← 학습 노트
    merge-sort.ts                ← 실제 구현 (export 해서 테스트에서 import)
    merge-sort.test.ts           ← Vitest 테스트
```

> 참고: `bfs_dfs` 폴더엔 아직 `.ts`/`.test.ts`가 없음. 테스트 환경(Vitest)을 구축하기 전에 진행한 세션이라 코드가 마크다운 안에만 남아있어서임. 필요하면 나중에 `merge_sort`와 같은 패턴으로 옮겨도 됨.

## 새 주제 시작할 때 체크리스트
1. `Algorithm/<topic_name>/` 폴더 생성 (폴더명은 소문자+언더스코어, 예: `merge_sort`)
2. `<Topic_Name>.md` 작성 — CLAUDE.md에 정의된 6단계 구조(문제 정의 → 구현 요구사항 → 코드 → 리뷰 → 꼬리질문 → 면접 요약) 그대로 사용
3. 구현 코드는 `<topic-name>.ts`에 작성하고 함수/클래스를 `export`
4. `<topic-name>.test.ts`에 Vitest로 테스트 작성 (아래 예시 참고)

```typescript
// merge-sort.test.ts
import { describe, expect, it } from "vitest";
import { mergeSort } from "./merge-sort";

describe("mergeSort", () => {
  it("오름차순으로 정렬한다", () => {
    expect(mergeSort([3, 1, 2], (a, b) => a - b)).toEqual([1, 2, 3]);
  });
});
```

## 테스트 실행 방법
레포 루트(`fullstack-til/`)에서 실행:

| 명령어 | 용도 |
|---|---|
| `npm test` | 전체 테스트 1회 실행 |
| `npm run test:watch` | 파일 변경을 감지하면서 계속 테스트 (코드 수정하며 바로 확인) |
| `npx vitest run 03_CS_And_Algorithm/Algorithm/merge_sort` | 특정 폴더/주제의 테스트만 실행 |
| `npx vitest run -t "안정 정렬"` | 테스트 이름에 특정 문자열이 포함된 것만 실행 (`-t` = test name 필터) |

## 참고: 설정 파일
- `tsconfig.json`의 `include`가 `03_CS_And_Algorithm/**/**/*.ts`로 되어 있어서, 주제 폴더가 몇 단계로 깊어져도(`Algorithm/merge_sort/merge-sort.ts` 등) 전부 타입 체크 대상에 포함됨.
- `vitest.config.ts`에서 `test.pool`을 `vmThreads`로 고정해둠. Vitest 기본 풀(`threads`)은 실제 OS 워커 스레드를 띄우는데, 샌드박스/제한된 실행 환경(예: 에이전트가 명령을 실행하는 격리된 쉘)에서는 스레드 생성이 막혀서 `describe(...)` 호출 시 `Cannot read properties of undefined (reading 'config')` 에러가 남. `vmThreads`는 실제 스레드 대신 같은 프로세스 안의 VM 컨텍스트에서 테스트를 돌려서 이 문제를 피함. (만약 같은 에러를 다시 보게 되면, 먼저 `node_modules` 재설치보다 이 pool 설정을 의심해볼 것.)
