# 정렬 알고리즘 - 병합 정렬 (Merge Sort)

## 1. 문제 정의 및 실무 맥락
- 정렬은 거의 모든 소프트웨어에 숨어있어: DB의 `ORDER BY`, 배열 정렬, 검색 결과 순위 매기기 등.
- 실무에서 흔한 실수: `[10, 9, 2].sort()`를 그냥 호출하면 `[10, 2, 9]`가 나옴 — JS의 기본 `sort()`는 **문자열(사전식) 비교**가 기본이라 숫자를 의도한 대로 정렬하려면 반드시 `compare` 콜백을 넘겨야 함. 지난 BST 세션에서 쓴 `compare(a, b)` 패턴이 여기서도 똑같이 등장함.
- 참고로 V8(Node.js/Chrome)의 `Array.prototype.sort()`는 내부적으로 병합 정렬 계열의 하이브리드 알고리즘(TimSort)을 씀. 오늘 직접 구현해보는 **병합 정렬(Merge Sort)**의 원리를 알면, 왜 JS의 `sort()`가 "안정 정렬(stable sort)"(같은 값의 원소들은 원래 순서를 유지)인지도 이해할 수 있음.
- 오늘의 핵심은 **분할 정복(Divide and Conquer)**: "배열을 쪼개고, 각각 정렬하고, 다시 합친다"는 전략이 왜 O(n log n)을 만들어내는지 직접 구현하면서 체감하는 것.

## 2. 구현 요구사항
```typescript
function mergeSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {}
```

**요구사항**
- 재귀적으로 배열을 반으로 나누고(divide), 각각 정렬한 뒤 다시 합치는(merge/conquer) 방식으로 구현
- `compare(a, b)`는 BST 세션과 동일한 규칙 (`a < b`면 음수, `a > b`면 양수, 같으면 0)
- 원본 배열(`arr`)을 직접 변경하지 않고, **정렬된 새 배열을 반환**하도록 구현 (원본이 바뀌면 호출하는 쪽에서 예상 못 한 사이드 이펙트가 생길 수 있음 — 이것도 실무에서 중요한 포인트)
- 재귀의 기저 조건(base case)이 뭔지 먼저 생각해보기 (배열 길이가 얼마일 때 더 쪼갤 필요가 없을까?)

**테스트 예시**
```typescript
mergeSort([5, 3, 8, 1, 9, 2], (a, b) => a - b);
// [1, 2, 3, 5, 8, 9]
```

## 3. 내가 작성한 코드
```typescript
function mergeSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
    const copyArr = [...arr];
    const length = copyArr.length;

    if (length > 3) {
        const mid = Math.floor(length / 2);
        const left = mergeSort(copyArr.slice(0, mid), compare);
        const right = mergeSort(copyArr.slice(mid), compare);

        let leftIndex = 0;
        let rightIndex = 0;
        const result = [];

        while (leftIndex < left.length && rightIndex < right.length) {
            if (compare(left[leftIndex], right[rightIndex]) <= 0) {
                result.push(left[leftIndex]);
                leftIndex++;
            } else {
                result.push(right[rightIndex]);
                rightIndex++;
            }
        }
        // 남은 요소들
        while (leftIndex < left.length) {
            result.push(left[leftIndex]);
            leftIndex++;
        }
        while (rightIndex < right.length) {
            result.push(right[rightIndex]);
            rightIndex++;
        }
        return result;
    } else {
        return copyArr.sort(compare);
    }
}
```

## 4. 코드 리뷰 피드백

**최종 코드는 정확함.**

1. **(안정성 버그, 발견 후 스스로 수정) 동점(tie) 시 right가 먼저 들어감** — `compare(...) < 0`일 때만 left를 넣다 보니, `compare === 0`(두 값이 같음)일 때 `else`로 빠져서 right가 먼저 들어감. left는 원본에서 더 앞쪽 구간이라, 같을 때는 left를 먼저 넣어야 원본 순서가 보존됨(안정 정렬). `<=0`으로 수정해서 해결.
2. **(설계 선택, 타당함) base case를 `length > 3`으로 잡은 것** — "길이 1~3은 쪼개고 합치는 오버헤드가 비교 자체보다 크다"는 판단. 실제 TimSort 같은 하이브리드 정렬도 작은 구간은 삽입 정렬로 처리하고 큰 구간만 병합 정렬로 처리하는 것과 같은 아이디어. 고정된 작은 크기(≤3) 정렬은 상수 시간이라 전체 복잡도(O(n log n))에 영향 없음.

**복잡도**:
- 시간 O(n log n) — 분할이 항상 배열 길이 기준으로 정확히 반으로 나뉘기 때문에 (BST처럼 "값에 따라" 쪼개지는 게 아니라 "위치/길이에 따라" 쪼개짐)
- 공간 O(n) — 매 병합마다 새 배열(`result`)을 생성하므로 in-place가 아님

## 5. 꼬리질문과 답변

### 1. Merge Sort는 입력 순서(정렬/역순/랜덤)와 무관하게 항상 O(n log n)인데, 지난 BST 세션의 "정렬된 입력 → O(n)" 문제와 뭐가 다를까?

- **답변**: Merge Sort는 값을 기준으로 나누는 게 아니라 단순히 배열의 길이로만 분할하기 때문. 값을 비교해서 나뉘는 BST와는 다른 점.
- **정리**: 정확함. 분할이 `Math.floor(length/2)`로 길이만 보고 나뉘기 때문에 입력 순서와 무관하게 항상 균형 잡힌 분할 구조가 나옴.

### 2. 지금 구현(매 병합마다 새 배열 생성)과 Quick Sort(원본 배열 내 swap, in-place)를 공간복잡도 관점에서 비교하면?

- **답변**: 배열 길이가 늘어날수록 차지하는 공간이 더 많아지는 것 같다 (추가 설명은 어려워함).
- **정리**: Merge Sort는 매 병합마다 새 배열을 만들어서 O(n) 추가 공간이 필요함. Quick Sort는 원본 배열 안에서 원소를 교환(swap)만 해서 정렬하므로 추가로 쓰는 공간은 재귀 호출 스택뿐 — 분할이 균형 잡혀 있으면 O(log n). 그래서 실무에서 Quick Sort가 공간 효율 면에서 더 선호되는 경우가 많음.
  - **반전 포인트**: Quick Sort는 피벗을 단순하게(예: 항상 첫 번째 원소) 고르면, 이미 정렬된/역순 배열에서 분할이 한쪽으로 치우쳐 최악의 경우 O(n²)이 됨 — 지난 BST의 "정렬된 입력이 트리를 치우치게 만든 것"과 동일한 패턴. Merge Sort는 길이로만 나눠서 이 문제가 없었지만, 값 기준으로 나누는 Quick Sort는 이 문제를 다시 마주함.

## 6. 면접용 설명 요약
> 정렬은 DB의 `ORDER BY`나 배열 정렬처럼 실무 어디에나 쓰이는데, JS의 기본 `sort()`도 내부적으로 병합 정렬 계열(TimSort)을 씁니다. 그 원리를 이해하려고 병합 정렬을 직접 구현해봤습니다. 핵심은 분할 정복(Divide and Conquer)으로, 배열을 길이 기준으로 반씩 나누고 각각 정렬한 뒤 두 포인터로 병합하는 과정을 반복합니다.
>
> 구현하면서 겪은 중요한 버그는 안정 정렬(stable sort) 조건이었습니다. 두 값이 같을 때(`compare === 0`) 어느 쪽을 먼저 넣느냐에 따라 원본의 상대적 순서가 보존되는지가 갈리는데, 처음엔 `compare < 0`일 때만 왼쪽을 넣어서 동점 상황에 오른쪽이 먼저 들어가버려 안정성이 깨졌습니다. 왼쪽은 원본에서 더 앞쪽 구간이었기 때문에, 동점일 때도 왼쪽을 먼저 넣도록(`<= 0`) 고쳐서 해결했습니다.
>
> 또한 병합 정렬은 배열의 "길이"만 기준으로 분할하기 때문에, 입력이 정렬되어 있든 역순이든 항상 O(n log n)을 보장한다는 걸 BST 세션과 비교하며 이해했습니다. BST는 "값"을 기준으로 나뉘기 때문에 정렬된 입력에서 한쪽으로 치우치는 문제가 있었는데, Quick Sort도 피벗을 값 기준으로 고르기 때문에 비슷한 약점을 가질 수 있다는 것도 함께 짚었습니다. 다만 Quick Sort는 원본 배열 내에서 교환만 하는 in-place 방식이라 공간복잡도가 O(log n)으로, 매번 새 배열을 만드는 병합 정렬의 O(n)보다 공간 효율이 좋다는 트레이드오프도 배웠습니다.
