# 데이터베이스 인덱스 & B-Tree

## 1. 문제 정의 및 실무 맥락
- PostgreSQL에서 `WHERE`, `JOIN`, `ORDER BY`의 성능은 대부분 "인덱스를 타느냐 안 타느냐"로 갈림. 인덱스가 없는 컬럼으로 큰 테이블을 검색하면 **Sequential Scan**(테이블 전체를 처음부터 끝까지 훑는 것, O(n))이 발생해서 row가 많아질수록 선형적으로 느려짐.
- PostgreSQL의 기본 인덱스 타입이 **B-Tree**야. 인덱스를 걸면 왜 검색이 O(log n)에 가까워지는지, 그 이유가 바로 B-Tree라는 자료구조의 성질 때문.
- 실무에서 `EXPLAIN ANALYZE`를 찍었을 때 `Seq Scan`과 `Index Scan`을 구분해서 읽고, "이 쿼리는 왜 인덱스를 안 타지?"를 판단하려면 B-Tree가 어떻게 정렬된 상태를 유지하면서 탐색/삽입하는지 원리를 알아야 함.
- 오늘은 먼저 B-Tree의 뿌리가 되는 **이진 탐색 트리(BST)**로 "정렬된 트리 구조에서 탐색이 왜 빠른가"의 핵심 원리를 만들어보고, 그다음 실제 DB가 쓰는 B-Tree(노드 하나에 여러 키를 담는 다진 트리)가 BST와 뭐가 다르고 왜 그렇게 설계됐는지 이어서 짚어볼 거야. (진짜 B-Tree의 노드 분할/병합까지 한 번에 구현하기엔 개념이 많아서, 오늘은 BST부터 단계적으로.)

## 2. 구현 요구사항
```typescript
interface BSTNode<T> {
  value: T;
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;
}

class BinarySearchTree<T> {
  constructor(private compare: (a: T, b: T) => number) {}

  // value를 트리에 삽입 (정렬 순서 유지)
  insert(value: T): void {}

  // value가 트리에 있는지 탐색
  search(value: T): boolean {}
}
```

**제약조건**
- `compare(a, b)`는 배열 정렬 콜백처럼 `a < b`면 음수, `a > b`면 양수, 같으면 0을 반환한다고 가정 (숫자든 객체든 어떤 타입이든 트리에 담을 수 있게 하기 위함).
- `insert`, `search` 둘 다 "트리의 높이(height)만큼의 시간"이 걸리도록 구현 (재귀든 반복문이든 자유).
- 중복값 삽입은 어떻게 처리할지 네가 정해도 됨 (예: 무시, 왼쪽/오른쪽 중 한쪽으로 통일 등 — 나중에 왜 이 선택이 중요한지 이야기할 거야).

## 3. 내가 작성한 코드
```typescript
interface BSTNode<T> {
  value: T;
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;
}

class BinarySearchTree<T> {
  constructor(private compare: (a: T, b: T) => number) {}

  private root:BSTNode<T> | null = null;

  // value를 트리에 삽입 (정렬 순서 유지)
  insert(value: T): void {
    if(!this.root) {
        this.root = {value, left: null, right: null};
        return;
    }

    let current = this.root;
    while(current) {
        let cmp = this.compare(value, current.value);
        if(cmp < 0) {
            if(!current.left) {
                current.left = {value, left:null, right:null};
                return;
            } 
            current = current.left;
        } else if(cmp > 0) {
            if(!current.right) {
                current.right = {value, left:null, right:null};
                return;
            }
            current = current.right;
        } else {
            // 같은 값은 무시
            return;
        }
    }
    

  }

  // value가 트리에 있는지 탐색
  search(value: T): boolean {
    let current = this.root;

    while(current) {
        let cmp = this.compare(value, current.value);

        if(cmp === 0) return true;
        else if(cmp < 0) current = current.left;
        else current = current.right;
    }

    return false;
  }
}

```

- 내가 계속 compare 함수를 직접 구현해야 비교가 되는 것 아닌가 라고 생각했었음. 위 코드는 compare 함수에 비교 함수를 인자로 받아서 구현된 거 였음.
- 예시: `const tree = new BinarySearchTree((a:number, b:number) => a - b);` 이런식으로 사용

## 4. 코드 리뷰 피드백

**코드 자체는 정확함.** `insert`/`search` 모두 버그 없이 요구사항대로 동작.

- **복잡도**: 트리의 높이(height)만큼의 시간 — 요구사항 충족.
- **가독성 (참고)**: `insert`의 `while(current)` 조건은 루프 내부에서 항상 `return`으로 빠져나가서 실질적으로 `while(true)`와 동일하게 동작함. 틀린 건 아니고 스타일 참고 사항.
- **엣지케이스 (오늘의 핵심 논의)**: 정렬된 순서(`1,2,3,4,5`)로 삽입하면, 매번 `cmp > 0`(오른쪽)으로만 이동하게 되어 트리가 사실상 연결리스트처럼 한쪽으로 늘어짐. 이 상태에서는 높이가 `log n`이 아니라 `n`이 되어 `search`가 O(n)으로 느려짐. **이건 코드 버그가 아니라 "순수 이진 탐색 트리" 알고리즘 자체의 근본적인 약점** — 실제 DB가 왜 그냥 BST가 아니라 균형을 유지하는 B-Tree를 쓰는지의 핵심 동기가 됨.

## 5. 꼬리질문과 답변

### 1. 정렬된 데이터를 넣어도 트리가 한쪽으로 치우치지 않게 하려면, AVL/Red-Black/B-Tree 같은 트리들은 삽입 시 무엇을 추가로 해야 할까?

- **답변**: 좌우로 어떤 기준을 가지고 균등하게 분배해야 할 것 같다. 그래야 디스크를 덜 읽어서 부하를 줄일 수 있을 것 같다.
- **정리**: "균등 분배"라는 방향은 정확함. 구체적으로는 삽입/삭제 직후 **"트리가 균형을 잃었는지 확인하고 구조를 재조정(rebalancing)하는 단계"**가 추가로 필요함. AVL/Red-Black 트리는 **회전(rotation)**으로, B-Tree는 노드가 담을 수 있는 키 개수를 초과하면 **노드 분할(split)**로 재조정함. 이 단계 덕분에 삽입 순서와 무관하게 높이가 항상 `log n` 근처로 유지됨.

### 2. B-Tree가 이진이 아니라 노드 하나에 여러 키를 담는 다진(multi-way) 구조로 설계된 이유는, DB가 디스크에서 데이터를 읽는 방식(페이지/블록 단위)과 어떻게 연결될까?

- **답변**: 전체를 스캔하는 것보다 페이지/블록 단위로 읽는 게 효율적일 것 같다. 데이터가 많아지면 전체를 스캐닝하는 게 오래 걸려서 비효율적일 것 같다.
- **정리**: 핵심은 "**노드 하나의 크기를 디스크 페이지 크기에 맞춰서, 노드 하나 = 디스크 읽기 1번**"이 되도록 설계했다는 점. 노드에 키를 많이 담을수록(분기 수↑) 트리 높이가 급격히 낮아짐 — 데이터 100만 건 기준, 이진 트리는 높이 약 20(디스크 20번 읽기)인데 분기 수 100인 B-Tree는 높이 약 3(디스크 3번 읽기)이면 충분함. 즉 B-Tree는 "메모리 내 비교 횟수"가 아니라 "**디스크 I/O 횟수**"를 최소화하는 걸 목표로 설계된 구조.

## 6. 면접용 설명 요약
> PostgreSQL에서 인덱스가 없는 컬럼을 검색하면 Sequential Scan이 발생해서 테이블이 커질수록 선형적으로 느려집니다. PostgreSQL의 기본 인덱스 타입인 B-Tree는 이 문제를 해결하기 위한 자료구조인데, 원리를 이해하려고 먼저 이진 탐색 트리(BST)를 직접 구현해봤습니다.
>
> BST는 값을 비교해서 작으면 왼쪽, 크면 오른쪽으로 내려가면서 자리를 찾기 때문에, 트리가 균형 잡혀 있으면 탐색이 O(log n)입니다. 하지만 직접 구현하면서 확인한 중요한 한계는, 정렬된 순서로 데이터를 넣으면 트리가 한쪽으로만 계속 자라서 사실상 연결리스트가 되고 O(n)으로 느려진다는 점이었습니다. 이게 코드 버그가 아니라 순수 BST 알고리즘 자체의 근본적인 약점이라는 걸 트레이싱하면서 체감했습니다.
>
> 실제 DB는 이 문제를 두 가지 방식으로 해결합니다. 첫째, 삽입/삭제 시마다 트리가 균형을 잃었는지 확인하고 구조를 재조정하는 리밸런싱 과정(회전, 노드 분할 등)을 거쳐서 높이를 항상 `log n` 근처로 유지합니다. 둘째, B-Tree는 이진이 아니라 노드 하나에 여러 키를 담는 다진 구조인데, 이건 노드 하나의 크기를 디스크 페이지 크기에 맞춰서 "노드 하나 = 디스크 읽기 1번"이 되게 하기 위함입니다. 노드에 키를 많이 담을수록 트리 높이가 급격히 낮아지므로, 결국 B-Tree는 메모리 내 비교 횟수가 아니라 디스크 I/O 횟수를 최소화하도록 설계된 구조라는 게 오늘 배운 핵심입니다.
