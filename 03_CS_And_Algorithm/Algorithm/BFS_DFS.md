# 그래프 탐색 (BFS / DFS)

## 1. 문제 정의 및 실무 맥락
- 그래프는 생각보다 실무 곳곳에 숨어있어: npm 패키지 의존성 관계, 조직도/팔로우 관계 같은 소셜 네트워크, 지도 앱의 경로 탐색, 웹 크롤러의 링크 추적, 빌드 시스템의 작업 순서(의존성) 등. 지난 세션에서 다룬 트리(BST)도 사실 "사이클이 없는 특수한 그래프"일 뿐이야.
- **BFS(너비 우선 탐색)**와 **DFS(깊이 우선 탐색)**는 그래프를 순회하는 두 가지 기본 전략이야. 언제 뭘 쓰느냐가 실무에서 중요함:
  - "간선에 가중치가 없는 그래프에서 최단 경로"를 구해야 하면 → BFS (한 단계씩 넓게 퍼지면서 탐색하니까 먼저 도달하는 게 곧 최단 경로)
  - "연결된 요소를 다 찾아야 하거나, 사이클 탐지, 작업 순서(위상 정렬)"가 필요하면 → DFS가 자연스러움
- 실무 버그 예시: 그래프에 사이클이 있는데 "방문 처리(visited)"를 안 하면 무한 루프에 빠짐. 재귀로 DFS를 짰는데 그래프가 매우 깊으면(또는 사이클을 못 끊으면) 스택 오버플로우가 날 수 있음.
- 오늘은 그래프를 인접 리스트(adjacency list)로 표현하고, 그 위에서 BFS/DFS를 직접 구현해볼 거야.

## 2. 구현 요구사항
```typescript
class Graph<T> {
  private adjacency: Map<T, T[]> = new Map();

  // 무방향(undirected) 그래프라고 가정. a-b 간선을 추가 (양쪽 모두에 서로를 이웃으로 등록)
  // a 또는 b가 아직 그래프에 없으면 자동으로 노드로 등록.
  addEdge(a: T, b: T): void {}

  // start에서 시작해서 BFS로 방문한 노드를 "방문한 순서대로" 배열로 반환
  bfs(start: T): T[] {}

  // start에서 시작해서 DFS로 방문한 노드를 "방문한 순서대로" 배열로 반환
  dfs(start: T): T[] {}
}
```

**제약조건**
- 그래프에 **사이클이 있을 수 있음** — 같은 노드를 두 번 방문하지 않도록 처리 필수.
- `start`가 그래프에 없는 노드일 경우는 네가 정해도 됨 (빈 배열 반환 등).
- `dfs`는 재귀/반복문(명시적 스택) 둘 다 가능 — 편한 방식으로.
- 이 그래프로 아래처럼 테스트할 수 있어야 함:
  ```typescript
  const g = new Graph<string>();
  g.addEdge("A", "B");
  g.addEdge("A", "C");
  g.addEdge("B", "D");
  g.addEdge("C", "D"); // 사이클 발생 지점 (A-C-D-B-A로 순환 가능)
  console.log(g.bfs("A")); // ["A", "B", "C", "D"] 같은 방문 순서
  console.log(g.dfs("A"));
  ```

## 3. 내가 작성한 코드
```typescript
class Graph<T> {
  private adjacency: Map<T, T[]> = new Map();

  // 무방향(undirected) 그래프라고 가정. a-b 간선을 추가 (양쪽 모두에 서로를 이웃으로 등록)
  // a 또는 b가 아직 그래프에 없으면 자동으로 노드로 등록.
  addEdge(a: T, b: T): void {
    if(!this.adjacency.has(a)) {
        this.adjacency.set(a, [b]);
    } else {
        this.adjacency.get(a).push(b);
    }

    if(!this.adjacency.has(b)) {
        this.adjacency.set(b, [a]);
    } else {
        this.adjacency.get(b).push(a);
    }
  }

  /**
   * A : [ B, C ]
   * B : [ A, D ]
   * C : [ A, D ]
   * D : [ B, C ]
   */

  // start에서 시작해서 BFS로 방문한 노드를 "방문한 순서대로" 배열로 반환
  bfs(start: T): T[] {
    if(!this.adjacency.has(start)) {
        return [];
    }

    const queue:T[] = [start];
    const visited = new Set<T>();
    const result:T[] = [];

    let index = 0;
    while(index < queue.length) {
        const current = queue[index];
        index++;
        
        if(visited.has(current)) continue;
        visited.add(current);
        result.push(current);

        const neighbors = this.adjacency.get(current) || [];
        for(const neighbor of neighbors) {
            if(!visited.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }

    return result; 
  }

  // start에서 시작해서 DFS로 방문한 노드를 "방문한 순서대로" 배열로 반환
  dfs(start: T): T[] {
    if(!this.adjacency.has(start)) {
        return [];
    }

    const stack:T[] = [start];
    const visited = new Set<T>();
    const result:T[] = [];

    while(stack.length > 0) {
        const current = stack.pop();

        if(current === undefined) continue;
        if(visited.has(current)) continue;
        visited.add(current);
        result.push(current);

        const neighbors = this.adjacency.get(current) || [];
        for(const neighbor of neighbors) {
            if(!visited.has(neighbor)) {
                stack.push(neighbor);
            }
        }
    }

    return result; // A, C, D, B
  }
}
```

## 4. 코드 리뷰 피드백

**최종 코드는 정확함.**

1. **(정확성 확인) BFS 방문 순서 의심 → 실제로는 정답** — `D`가 `B`와 `C` 양쪽에서 각각 큐에 push되어 큐에 중복으로 들어가지만, 두 번째 `D`는 dequeue될 때 `visited.has(current)` 체크에 걸려 스킵되므로 결과 배열(`[A,B,C,D]`)엔 영향 없음. 손으로 트레이싱해서 직접 확인함.
2. **(치명적 복잡도 문제, 발견 후 스스로 수정) `queue.shift()`의 숨은 O(n) 비용** — `Array.prototype.shift()`는 배열 첫 요소를 제거하고 나머지를 전부 한 칸씩 당기는 연산이라 O(1)이 아니라 O(n). 매 루프마다 호출하면 BFS 전체가 최악의 경우 O(V²)까지 느려짐. → `shift()` 대신 `index` 포인터로 큐를 순회하도록 수정해서 O(1) 접근으로 해결. (반면 DFS의 `stack.pop()`은 배열 끝에서 제거하는 연산이라 원래부터 O(1) — 문제 없었음.)
3. **(가독성, 선택) `current === undefined` 방어 코드** — `shift()` 버전의 잔재로, `index < queue.length` 조건 덕분에 지금은 항상 `queue[index]`가 정의돼 있어 사실상 죽은 코드. 지워도 무방.

**복잡도**: `bfs`/`dfs` 모두 O(V+E) — 노드마다 한 번씩 방문(visited 체크), 간선마다 최대 한 번씩 탐색.

## 5. 꼬리질문과 답변

### 1. `queue.shift()`(앞에서 제거)는 O(n)인데 `stack.pop()`(뒤에서 제거)은 왜 O(1)일까?

- **답변**: shift는 재배열 때문에 전체 배열을 한 번 더 확인하게 되고, pop은 재배열할 필요가 없어서 그런 것 같다.
- **정리**: 핵심은 정확함. 정확히는 "확인(체크)"이 아니라, 앞 요소가 빠지면서 생긴 빈자리를 메우려고 **나머지 요소를 전부 한 칸씩 실제로 이동(복사)**시켜야 해서 O(n)임. `pop()`은 배열 끝에서 길이만 하나 줄이면 끝이라 다른 요소를 건드릴 필요가 없어 O(1).

### 2. BFS로 "방문 순서"가 아니라 "최단 경로"를 구하려면 개념적으로 뭘 추가로 기록해야 할까?

- **답변**: 몇 번 만에 도착하는지 저장해둘 변수/배열이 필요할 것 같다.
- **정리**: 정확히 절반 맞음 — 그건 **거리(distance) 정보**로, 최단 "경로 길이"를 구하는 데 필요함. 실제 "경로"(어떤 노드를 거쳐왔는지) 자체를 복원하려면 **"이 노드를 누가 처음 발견했는지" 기록하는 parent 맵**(`Map<T, T>`)이 하나 더 필요함. 방문 시 `parent.set(neighbor, current)`로 기록해두면, 도착 노드에서 `parent`를 계속 거슬러 올라가 시작 노드까지의 경로를 복원할 수 있음(뒤집으면 정방향 경로). BFS는 레벨 순서로 넓게 퍼지며 탐색하기 때문에, 한 노드가 처음 발견되는 순간이 항상 최단 경로를 통해서라는 게 이 방법이 성립하는 이유.

## 6. 면접용 설명 요약
> 그래프는 npm 의존성, 조직도, 지도 경로 탐색처럼 실무 곳곳에 등장하고, 이걸 순회하는 두 가지 기본 전략이 BFS와 DFS입니다. 가중치 없는 그래프의 최단 경로가 필요하면 BFS를, 연결 요소 탐색이나 사이클 탐지, 작업 순서(위상 정렬)가 필요하면 DFS를 씁니다. 저는 그래프를 인접 리스트로 표현하고, 사이클이 있는 그래프에서도 무한 루프에 빠지지 않도록 `visited` 집합을 이용해 BFS/DFS를 직접 구현해봤습니다.
>
> 구현하면서 겪은 중요한 문제는, BFS의 큐를 배열의 `shift()`로 구현했더니 논리적으로는 맞지만 성능상 문제가 있었다는 점입니다. `shift()`는 배열 앞 요소를 지우고 나머지를 전부 한 칸씩 옮기는 연산이라 O(1)이 아니라 O(n)이라서, 매 반복마다 호출하면 전체 BFS가 최악의 경우 O(V²)까지 느려질 수 있었습니다. 그래서 요소를 실제로 제거하는 대신 `index` 포인터로 "어디까지 처리했는지"만 기억하도록 바꿔서, 진짜 O(V+E) 복잡도를 달성했습니다. 반대로 DFS의 스택은 배열 끝에서 `pop()`하기 때문에 애초에 O(1)이라 문제가 없었습니다.
>
> 이 경험으로, 같은 배열이라도 앞에서 조작하느냐 뒤에서 조작하느냐에 따라 실제 성능이 크게 달라질 수 있다는 것과, BFS가 레벨 단위로 퍼지며 탐색하기 때문에 "거리"와 "부모 노드" 정보를 같이 기록하면 최단 경로 자체도 복원할 수 있다는 것을 배웠습니다.

## 추가 Q&A: BFS/DFS를 반대로 쓰면?

**질문**: BFS는 최단 경로, DFS는 연결 요소 탐색/사이클 탐지/작업 순서에 쓴다고 했는데, 반대로 써도 되나?

- **연결 요소 탐색**: BFS/DFS **완전히 동등함**. 도달 가능한 노드 집합은 순서와 무관하게 항상 같음. DFS가 관례적으로 더 자주 보이는 건 재귀로 짜면 코드가 짧아서일 뿐, BFS로 못 할 이유는 없음. (1단계에 "DFS가 자연스러움"이라고 쓴 건 단순화된 설명이었음.)
- **사이클 탐지**:
  - 무방향 그래프: BFS/DFS 둘 다 가능. "지금 온 곳(parent)이 아닌데 이미 방문한 노드"를 다시 만나면 사이클.
  - 방향 그래프: DFS가 더 자연스러움. 재귀 스택이 "현재 탐색 경로(조상 체인)"를 그대로 표현하기 때문에 "조상 노드로 되돌아가는 간선(back edge)"을 바로 감지 가능. BFS는 레벨 단위로 여러 갈래를 동시에 탐색해서 "현재 경로의 조상"이라는 개념이 자연스럽지 않음 → 대신 아래 Kahn's Algorithm 같은 별도 접근이 필요.
  - 작업 순서(위상 정렬): 사실 **BFS 기반의 표준 방법이 따로 있음 — Kahn's Algorithm**. 각 노드의 진입 차수(in-degree)를 세어두고, 진입 차수 0인 노드부터 큐에 넣고 처리하면서 이웃의 진입 차수를 줄여나감(줄어서 0이 되면 큐에 추가) → 이게 그대로 BFS. 끝까지 돌렸는데 처리된 노드 수가 전체보다 적으면 사이클이 존재한다는 뜻이라, 위상 정렬과 사이클 탐지를 BFS 하나로 동시에 해결 가능.
- **보너스(메모리 관점)**: DFS(재귀)의 최대 메모리는 "그래프 깊이"에 비례, BFS(큐)는 "그래프 너비(한 레벨의 노드 수)"에 비례. 깊고 좁은 그래프(체인 형태)는 DFS가 스택 오버플로우 위험이 있고, 넓고 얕은 그래프(허브 구조)는 BFS 큐가 한 번에 많은 노드를 담아야 할 수 있음.
