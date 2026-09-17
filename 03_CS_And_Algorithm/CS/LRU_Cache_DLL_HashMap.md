# LRU 캐시 구현 (이중 연결리스트 + 해시맵)

## 1. 문제 정의 및 실무 맥락
- 지난 세션에서 JS `Map`의 "삽입 순서 유지" 스펙에 기대어 O(1) LRU를 구현했지만, 이건 사실 JS/TS라서 가능한 편법에 가까워.
- 대부분의 언어(Java, Python, C++ 등)의 표준 해시맵은 순서를 보장하지 않기 때문에, 언어에 상관없이 통하는 "정석" 풀이는 **해시맵(빠른 조회) + 이중 연결리스트(빠른 순서 재배치)** 조합이야.
- 실무에서도 순수 캐시 라이브러리를 구현하거나, 메모리 레이아웃/성능을 세밀하게 제어해야 하는 상황(예: 매우 큰 캐시, GC 압박을 줄이고 싶은 경우)에서는 내장 자료구조의 숨은 동작에 기대기보다 직접 포인터를 조작하는 방식을 씀.
- 면접에서도 "Map만 쓰면 안 되나요?"에 이어 "그럼 Map 없이 직접 구현해보세요"라고 요구하는 경우가 흔함 — 포인터 조작, null 처리, dummy node 같은 기본기를 확인하려는 목적.
- 이번 구현의 핵심은: 해시맵은 **key → 노드 참조**만 O(1)로 찾아주는 역할만 하고, "누가 가장 오래됐는지/최근인지"는 전적으로 이중 연결리스트의 물리적 위치(포인터 연결)로 관리해야 함.

## 2. 구현 요구사항
```typescript
interface DListNode<K, V> {
  key: K;
  value: V;
  prev: DListNode<K, V> | null;
  next: DListNode<K, V> | null;
}

class LRUCache<K, V> {
  constructor(capacity: number) {}

  // 키로 값을 조회. 있으면 값을 반환하고 해당 노드를 리스트의 "최근 사용" 쪽 끝으로 이동.
  // 없으면 undefined 반환.
  get(key: K): V | undefined {}

  // 키-값을 저장. 이미 있는 키면 값 갱신 + 노드를 "최근 사용" 쪽 끝으로 이동.
  // 새 키인데 capacity 초과 시, 가장 오래된 노드를 리스트에서 제거하고 해시맵에서도 삭제.
  put(key: K, value: V): void {}
}
```

**제약조건**
- `Map`이나 배열의 순서 관련 기능(삽입 순서 순회, `unshift`/`splice` 등)에 의존하지 말 것. 순서 관리는 오직 노드의 `prev`/`next` 포인터 연결로만 처리.
- 해시맵(`Map<K, DListNode<K, V>>` 등)은 "key로 노드를 O(1)에 찾기" 용도로만 사용.
- `get`, `put` 모두 시간복잡도 O(1).
- head/tail을 실제 데이터 없는 **dummy 노드**로 둘지 말지는 네가 설계해봐 (힌트: dummy 노드를 쓰면 리스트가 비어있거나 노드가 1개일 때의 null 체크 분기를 줄일 수 있음).

## 3. 내가 작성한 코드
```typescript

interface DListNode<K, V> {
    key: K;
    value: V;
    prev: DListNode<K, V> | null;
    next: DListNode<K, V> | null;
}

class LRUCache<K, V> {
    private capacity: number;
    private cache: Map<K, DListNode<K,V>>;
    private head: DListNode<K, V>;
    private tail: DListNode<K, V>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.cache = new Map<K, DListNode<K,V>>();
        
        this.head = { key: null, value: null, prev: null, next: null };
        this.tail = { key: null, value: null, prev: null, next: null };
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    // 리스트 중간 어딘가에 있는 node를 물리적으로 끊어내기 (앞뒤 서로 연결)
    private removeNode(node: DListNode<K, V>): void {
        if(!node) return;

        const prev = node.prev;
        const next = node.next;

        prev!.next = next;
        next!.prev = prev;
    }

    // 항상 tail 바로 앞(= "가장 최근 사용"자리)에 node를 끼워넣기
    private addToFront(node: DListNode<K, V>) : void {
        const prev = this.tail.prev;
        prev!.next = node;
        node.prev = prev;

        node.next = this.tail;
        this.tail.prev = node;
    }

    get(key: K): V | undefined {
        const existingNode = this.cache.get(key);

        if(existingNode !== undefined) {
            // 키가 있는 거임 -> 가장 최근 데이터로 이동
            this.removeNode(existingNode);
            this.addToFront(existingNode);

            return existingNode.value;
        }

        return undefined;
    }

    put(key: K, value: V): void {
        const existingNode = this.cache.get(key);

        if(existingNode !== undefined) {
            // 키가 있는 거임 -> just 업데이트
            existingNode.value = value;
            this.removeNode(existingNode);
            this.addToFront(existingNode);

            return;
        } else {
            // 키가 없는 거임 -> 새로 생성
            const newNode : DListNode<K,V> = {
                key: key,
                value: value,
                prev: null,
                next: null
            }

            // 1. 일단 맵에 키-노드 등록
            this.cache.set(key, newNode);

            // 2. 리스트 맨앞(=최근)으로 끼우기
            this.addToFront(newNode);

            // 3. 용량 초과면? -> 렝스가 캡을 넘으면 가장 오래된 것 삭제
            if(this.cache.size > this.capacity) {
                const leastRecentNode = this.head.next;
                this.removeNode(leastRecentNode!);
                this.cache.delete(leastRecentNode!.key);
                
            }
        }
    }
}

/* head 쪽이 가장 오래된 데이터, tail 쪽이 가장 최근 데이터
    
    const cache = new LRUCache<string, number>(2);
    cache.put("a", 1);
    // tail.next 에 a, tail.prev 에 head.next
    cache.put("b", 2);
    // tail.next 에 b, tail.prev 에 a, 
    

*/

```

## 4. 코드 리뷰 피드백

**최종 코드는 정확함.** (지금 파일 3번 섹션의 코드가 곧 모범 답안)

1. **(치명적 버그, 발견 후 스스로 수정) 잘못된 "가장 오래된 노드" 계산** — `addToFront`는 항상 `tail.prev` 자리에 새/갱신 노드를 넣기 때문에, `put()`에서 `addToFront(newNode)` 직후 `this.tail.prev`를 "가장 오래된 노드"로 착각하면 방금 넣은 노드 자신을 가리키게 됨. 진짜 가장 오래된 노드는 `this.head.next`(dummy head 바로 다음). → `leastRecentNode = this.head.next`로 수정.
2. **(치명적 버그, 발견 후 스스로 수정) DLL에서만 제거하고 Map에서 미제거** — `removeNode()`는 연결리스트에서만 노드를 끊어낼 뿐 `Map`의 key→node 참조는 그대로 남아있어서, 용량 초과 시 evict한 노드가 Map에는 계속 남아 `cache.size`가 무한히 커지고, 그 키로 다시 get/put하면 죽은(리스트에서 끊긴) 노드에 접근하는 문제가 있었음. → `removeNode` 뒤에 반드시 `this.cache.delete(leastRecentNode!.key)`를 같이 호출하도록 수정.
3. **설계 포인트 — dummy head/tail 노드**: 실제 데이터 노드가 항상 head와 tail 사이에만 존재하도록 보장해서, `removeNode`/`addToFront`가 "리스트가 비었을 때"/"노드 1개일 때" 같은 예외 분기 없이 항상 동일한 포인터 재연결 로직으로 동작 가능.
4. **설계 포인트 — Map과 DLL의 역할 분리**: Map은 "key → 노드 참조"의 O(1) 조회만 담당하고, 노드의 순서(누가 가장 오래/최근인지)는 DLL의 물리적 위치로만 관리. 두 구조가 같은 노드 객체를 공유하기 때문에 리스트에서 노드를 옮기면 Map을 통한 조회 결과도 즉시 최신 상태가 됨 — 단, 이 불변식(같은 노드를 두 곳에서 동시에 관리)이 깨지면 위 2번 같은 버그가 발생.

**복잡도**: `get`/`put` 모두 O(1) — Map 조회/삽입/삭제 O(1), 포인터 재연결(`removeNode`/`addToFront`)은 리스트 크기와 무관하게 항상 고정된 개수의 포인터만 변경하므로 O(1).

## 5. 꼬리질문과 답변

### 1. dummy head/tail 노드의 `key`/`value`를 `null`로 만들었는데, `strict` 옵션이 켜지면 왜 타입 에러가 날까? 더 안전하게 하려면 어떻게 할 수 있을까?

- **답변**: `strictNullChecks`가 꺼져 있으면 TS는 `null`을 모든 타입의 서브타입으로 봐서 통과시켜주지만, 켜지면 `Type 'null' is not assignable to type 'K'` 에러가 난다. 더 안전하게 하려면, dummy 노드의 `key`/`value`는 "절대 실제로 읽히지 않는다"는 사실을 알고 있으니 `null as unknown as K` 같은 타입 단언으로 생성 시점에만 위험을 가두는 편이 낫다. `key: K | null`처럼 인터페이스 자체를 느슨하게 바꾸면, 실제 데이터 노드를 다룰 때도 매번 `null` 케이스를 신경 써야 해서 오히려 실수하기 쉬워진다.

### 2. TypeScript 실무 코드라면 Map 기반과 DLL+HashMap 기반 중 어느 걸 선택할까? 어떤 상황이면 다른 쪽을 선택하게 될까?

- **답변**: 단순한 연산만 필요하다면 Map 기반이 유지보수하기 쉬워서 그쪽을 선택할 것 같다. 다만 다른 언어로 포팅해야 하거나, 라이브러리/내장 자료구조 없이 구현해야 하는 제약이 있거나, "몇 번째로 오래된 항목 조회"처럼 Map의 API만으로는 지원할 수 없는 추가 연산이 필요하다면 DLL+HashMap을 선택해야 한다. (Map의 삽입 순서 보장은 TypeScript가 아니라 JavaScript(ECMAScript) 런타임 스펙에 의한 것이라는 점도 함께 짚음.)

## 6. 면접용 설명 요약
- 내가 작성한 요약
  - Map 대신 DLL + HashMap으로 구현할 수 있어야 하는 이유는 Map의 삽입 순서 보장, JavaScript 런타임에서만 동작하는 기능이다. 다른 언어(ex. python, C 등)에서는 동작하지 않기에 외부로 포팅을 고려한다거나, 라이브러리 없이 구현하라는 제약이 있다거나, LRU 외에 추가적인 연산으로 몇번쨰로 오래된 항목에 대한 조회가 필요한 경우에는 Map으로 구현하기 어렵거나 불가능한 경우가 발생하기 때문이다.
  - 핵심 설계로는 HashMap, Doubly Linked List를 사용한다. HashMap은 key를 통해 노드를 O(1)에 조회하기 위해 사용하고, Doubly Linked List는 노드의 순서를 관리하기 위해 사용한다.
  - Dummy Head/tail의 역할로는 list가 비어있거나 노드가 1개일 때 발생할 수 있는 예외적인 경우의 수를 줄이고, 동일한 포인터 재연결 로직으로 동작하기 위해 사용한다.

- **면접 답변용 정리 버전** (겪은 버그 포함)
  > "이전에는 JS `Map`의 삽입 순서 보장 스펙을 활용해서 LRU를 O(1)으로 구현했는데, 이건 JavaScript 런타임에서만 보장되는 동작이라 다른 언어로 포팅하거나 라이브러리 없이 구현해야 하는 상황에는 못 씁니다. 그래서 언어에 상관없이 통하는 정석 방식인 해시맵+이중 연결리스트로 다시 구현해봤습니다.
  >
  > 설계는 역할을 분리하는 게 핵심이었습니다. 해시맵은 key로 노드를 O(1)에 찾는 역할만 하고, 어떤 노드가 가장 오래됐는지/최근인지는 이중 연결리스트에서 노드의 물리적 위치로만 관리했습니다. 두 자료구조가 같은 노드 객체를 참조로 공유하기 때문에, 리스트에서 노드 위치를 옮기면 해시맵을 통한 조회 결과도 즉시 최신 상태가 됩니다. 그리고 리스트 양 끝에 실제 데이터가 없는 dummy head/tail 노드를 둬서, 리스트가 비어있거나 노드가 1개뿐인 경우도 별도 분기 없이 동일한 코드로 처리되게 했습니다.
  >
  > 구현하면서 두 가지 버그를 겪었는데, 둘 다 '해시맵과 리스트가 항상 같은 상태를 가리켜야 한다'는 불변식이 깨져서 생긴 문제였습니다. 첫 번째는 용량 초과 시 제거할 '가장 오래된 노드'를 반대쪽 끝(`tail.prev`)에서 찾는 실수였는데, 이건 방금 삽입한 노드 자신을 가리키고 있어서 엉뚱한 노드가 지워지는 버그였습니다. 두 번째는 리스트에서 노드를 제거해도 해시맵에서는 안 지워서, 캐시 용량이 사실상 무한정 늘어나고 죽은 노드에 다시 접근할 수 있는 버그였습니다. 둘 다 구체적인 시나리오를 직접 트레이싱하면서 찾아 고쳤고, 이 경험으로 '두 자료구조를 함께 쓸 때는 상태 동기화를 깨뜨리지 않는 게 핵심 불변식'이라는 걸 체감했습니다."