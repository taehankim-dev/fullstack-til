# LRU 캐시 구현

## 1. 문제 정의 및 실무 맥락
- 외부 API 응답, DB 조회 결과, 이미지 썸네일 등을 메모리에 캐싱해 응답 속도를 높이고 싶을 때, 캐시가 무한정 커지면 메모리가 터진다.
- 그래서 캐시 최대 용량(capacity)을 정해두고, 꽉 찼을 때 "가장 오랫동안 안 쓴 데이터"부터 지우는 정책이 필요 → LRU(Least Recently Used).
- 실무에서 in-memory 캐시(로컬 캐시, 세션 캐시 등)를 직접 구현하거나, Redis 같은 외부 캐시의 동작 원리를 이해할 때도 기본이 되는 자료구조.
- 배열/일반 객체로 순진하게 구현하면 "가장 오래 안 쓴 항목 찾기"가 O(n)이라 느림 → 실무 요구사항은 get/put 모두 O(1).

## 2. 구현 요구사항
```typescript
class LRUCache<K, V> {
  constructor(capacity: number) {}

  // 키로 값을 조회. 있으면 값을 반환하고 "최근 사용"으로 갱신.
  // 없으면 undefined 반환.
  get(key: K): V | undefined {}

  // 키-값을 저장. 이미 있는 키면 값 갱신 + "최근 사용"으로 갱신.
  // 새 키인데 capacity 초과 시, 가장 오래 안 쓴 항목을 제거하고 삽입.
  put(key: K, value: V): void {}
}
```

**제약조건**
- `get`, `put` 모두 시간복잡도 O(1) 이어야 함.
- capacity는 1 이상의 양수라고 가정해도 됨 (엣지케이스로 0이나 음수를 고려할지는 네가 판단해봐도 좋음).

## 3. 내가 작성한 코드
```typescript
class LRUCache<K, V> {
    private capacity: number;
    private cache: Map<K, V>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map<K, V>();
    }

    private access(key: K, value: V) {
        this.cache.delete(key);
        this.cache.set(key, value);
    }

    get(key: K): V | undefined {
        const value = this.cache.get(key);

        if(value !== undefined) {
            this.access(key, value);
        }
        
        return value;
    }

    put(key: K, value: V): void {
        // 이미 캐시에 있으면 덮어쓰기
        if(this.cache.has(key)) {
            this.access(key, value);
            return;
        }

        // 용량이 초과되면 오래된 캐시 제거
        if(this.cache.size >= this.capacity) {
            // Map의 첫 번째 키가 가장 오래된 항목
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, value);
    }
}

```

## 4. 코드 리뷰 피드백

**최종 코드는 정확함.** 아래는 이번 라운드에서 다룬 이슈와 수정 과정 요약.

1. **(치명적 버그) 새 키 삽입 누락** — 최초 버전에서 `put()`이 "기존 키 갱신" 또는 "용량 초과로 제거" 분기에서만 `set`을 호출해서, 용량이 남아있는 상태에서 새 키를 넣으면 아무 일도 일어나지 않았음. → 분기 밖에서 항상 `set`을 호출하도록 수정해서 해결.
2. **(가독성) 중복 로직 추출** — `get`/`put` 양쪽에서 "delete 후 다시 set → 최근 사용으로 표시"하는 패턴을 `private access()` 헬퍼로 분리. Map은 기존 키에 `set`만 호출하면 값은 갱신되지만 삽입 순서(위치)는 바뀌지 않기 때문에, 순서를 맨 뒤로 옮기려면 반드시 `delete` 후 `set`을 다시 해야 함 — 이 방식이 정확히 그 역할을 함.
3. **(falsy 트랩 버그) `!value` → `value !== undefined`** — 처음엔 `if (!value) return undefined`로 존재 여부를 판단해서, `0`/`""`/`false`/`null` 같은 정당한 falsy 값이 캐시에 저장돼 있어도 "없는 값"처럼 취급되는 버그가 있었음. 중간 시도에서 `NaN`을 `!==`로 비교하려 한 것도 무의미했음(`NaN`은 자기 자신과도 항상 다르다고 정의됨). 최종적으로 `value !== undefined` 단 하나의 체크로 해결 — Map이 "키 없음"을 나타내는 유일한 신호가 `undefined`이기 때문. (참고: 이 방식은 "값으로 `undefined`를 명시적으로 저장하는 경우"와 "키 자체가 없는 경우"를 구분하지 못하는데, 이는 네이티브 `Map.get()` 자체의 한계를 그대로 물려받은 것이라 문제 없음.)

**복잡도**: `get`/`put` 모두 O(1) (Map의 `get`/`set`/`delete`/`keys().next()`가 전부 O(1)이므로).

## 5. 꼬리질문과 답변

### 1. `access()` 헬퍼에서 `delete` 후 `set`을 다시 하는 이유를 스스로 찾아냈지? 그럼 반대로 물어볼게 — 만약 `access()`에서 `delete` 없이 `this.cache.set(key, value)`만 호출했다면, `get`을 여러 번 호출했을 때 캐시의 "제거 순서(eviction order)"가 실제로 어떻게 달라질까? 구체적인 시나리오(예: capacity=3, a→b→c 순서로 put 후 a를 get)로 설명해봐.

- **답변** : `access()` 에서 `delete` 없이 `this.cache.set(key, value)`만 있는 상태로 `a`를 get 을 하게 된다면, `a`가 가장 최근 이용 데이터로 추가될 수 없다. capacity가 3인 상태로 a -> b -> c 를 put 한 후 a를 get을 하게 된다면, a의 위치는 그대로 유지된다. a 를 가장 최근에 사용했지만 가장 오래된 데이터가 된다. 만약 `put(d)`를 호출하게 된다면, 가장 오래된 데이터인 b가 삭제되어야 하지만 가장 최근 사용했던 a가 우선적으로 제거된다. 그러므로 `delete`를 반드시 사용해주어야 한다.

### 2. 지금 구현은 JS `Map`의 "삽입 순서를 유지한다"는 스펙을 활용해서 O(1)을 달성했어. 근데 언어/CS 교과서에서 LRU 캐시의 "정석" 풀이로 소개되는 건 보통 ** 해시맵 + 이중 연결리스트(Doubly Linked List) ** 조합이야. 면접관이 "왜 Map만으로 충분하다고 생각했나요? 이중 연결리스트를 직접 구현하는 것과 비교하면 트레이드오프가 뭔가요?"라고 물으면 어떻게 답할래?

- **답변** : JavaScript의 내장 객체인 `Map`은 삽입 순서를 기억한다는 보장된 스펙을 갖고 있기 때문에 이중 연결리스트를 직접 구현하지 않고 Map 만으로 LRU 캐시를 구현할 수 있다. 이중 연결리스트를 직접 구현하게 된다면 코드가 더 복잡해지고 디버깅도 어렵다는 단점이 있지만, Map을 사용하게 되면 코드가 더 간결하고 가독성이 좋아진다는 장점이 있다.

## 6. 면접용 설명 요약
- LRU 캐시가 필요한 이유는 메모리가 한정되어 있기 때문에 가장 오랫동안 사용되지 않은 데이터를 우선적으로 제거하며 메모리를 효율적으로 사용해야 한다는 점이다. 
- 구현 방법은 보통 해시맵 + 이중 연결리스트를 조합하지만 JavaScript 에서는 삽입 순서를 기억하는 Map을 사용해서 더 간결하게 O(1) 형태로 구현 가능하다. 
- 구현하면서 delete + set 구조를 공통 함수로 빼내어 최신 데이터를 보장하도록 작성했다. 또한 falsy 값에 대한 처리를 undefined 체크 하나만 사용했다. 0, ""(빈 문자열), false 와 같은 사용자가 직접 넣을 수 있는 falsy 값에 대해서는 캐시에 남아있게 하기 위함이다. 

## Update
- 26.08.24