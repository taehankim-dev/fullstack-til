# 코딩 테스트 대비용 유형별 풀이 방법

## 1. 투 포인터(슬라이딩 윈도우)
> 가변 길이 투 포인터

### 1) `for`문만 쓰는 슬라이딩 윈도우 (고정 길이)

#### 언제 쓰는 것인가!
- 윈도우 길이 K가 고정
- "연속한 K개의 합/최댓값/최솟값/개수" 같은 문제
- 예: 백준 2559, 12847, 21921

#### 패턴
- 처음 K개 합을 만들고
- i를 K부터 N-1까지 돌리면서 `-빠진 값 + 들어온 값`

```js
let sum = 0;
for(let i = 0; i < K; i++) sum += arr[i]

let best = sum;
for(let i = K; i < N; i++){
    sum = sum - arr[i - K] + arr[i];

    if(sum > best) {
        best = sum;
    }
}
```

- 특징: right = i, left = i-K 라서 변수 두 개를 굳이 안 둠.
- 가장 깔끔하고 실수 적음

### 2) `left` 하나만 쓰는 슬라이딩 윈도우 (고정 길이의 다른 표현)

#### 언제 쓰는 것인가!
- 위 1) 과 같은 고정 길이인데, `left`를 명시하고 싶을 때
- 또는 queue/빈도표 같은 상태관리가 같이 들어가서 "구간 시작점"을 명확히 두고 싶을 때

```js
let left = 0;
let sum = 0;

// right가 for문의 i로 숨어있음.
for(let i = 0; i < N; i++){
    sum += arr[i];

    if(i - left + 1 === K) {
        sum -= arr[left];
        left++;
    }
}
```

- 특징: right는 `for(i=...)`로 존재하지만, "left만 따로 변수"로 둠.
- K 고정인데도 "윈도우를 유지한다" 감각이 더 잘 보임
- 21921번처럼 max와 count까지 다룰 때도 이 형태로 많이 함.

### 3) `left + right` 둘 다 쓰는 투 포인터 (가변 길이)

#### 언제 쓰는 것인가!
- 윈도우 길이가 고정이 아님
- 조건에 따라 늘렸다 줄였다 해야 함.
- 예: 2003(연속합), 1806(부분합), "합이 M 이상이면 줄이고, 부족하면 늘리는" 류
- 보통 배열 원소가 양수일 때 깔끔하게 성립

#### 패턴
```js
let left = 0, right = 0;
let sum = 0;
let count = 0;

while(true) {
    if(sum >= M) {
        if(sum === M) count++;
        sum -= arr[left++];
    } else {
        if(right === N) break;
        sum += arr[right++];
    }
}
```

- 특징: left/right 둘 다 조건에 의해 움직임.
- "고정 길이"가 아니라서 슬라이딩 윈도우(고정 K) 템플릿을 쓰면 꼬임

### 4) 그럼 "어떻게 나눠서" 쓰면 되는가!

#### Q1. 구간 길이가 고정이야?
- 고정이면 -> 슬라이딩 윈도우 (1번 or 2번)
- 고정이 아니면 -> 투 포인터(가변)

#### Q2. 조건이 "sum이 커지면 줄이고, 작으면 늘리고" 처럼 단조로워?
- 단조롭다(주로 양수 배열) -> 투 포인터 잘 됨
- 단조롭지 않다(음수/0 섞임) -> 투 포인터가 깨질 수 있음
-> 이 땐 보통 누적합+해시, 정렬+투포인터, 다른 접근 필요

--- 

## 2. 투 포인터 (양 끝 투 포인터, Two-sum / Pair 탐색)

### 1) 양 끝 투 포인터 

#### 언제 쓰는 것인가!
- 정렬할 수 있는 1차원 배열
- 두 개(또는 k개)의 조합을 찾는 문제
- 대표 형태
    - 두 수의 합이 X인 쌍의 개수
    - 두 수의 합이 X에 가장 가까운 값
    - 두 수의 합이 특정 조건(>=, <=) 만족
- 예: 3273

키워드: 연속 구간이 아님!, "pair/조합"임!

#### 왜 정렬이 필요한가!
정렬되면 합의 크기가 단조롭게 움직여서 포인터를 움직이는 규칙이 생김.
- `arr[left] + arr[right]`가 너무 작다
    -> 작은 쪽을 키워야 하니까 `left++`
- `arr[left] + arr[right]`가 너무 크다.
    -> 큰 쪽을 줄여야 하니까 `right--`

#### 기본 패턴
"정확히 X를 만드는 쌍의 개수(3273 타입)"
```js
arr.sort((a,b) => a - b);

let left = 0;
let right = N - 1;
let count = 0;

while(left < right) {
    const sum = arr[left] + arr[right];

    if(sum === X) {
        count++;
        left++;
        right--;
    } else if(sum < X) {
        left++;
    } else {
        right--;
    }
}
```
- `left < right` 유지: 같은 원소 두 번 쓰는 거 방지.
- `sum === X` 일 때 둘 다 이동: 다음 후보로 넘어감.

#### 이동 규칙을 "문장"으로 외워!
> 작으면 left++ / 크면 right-- / 같으면 count++ 하고 둘 다 이동

#### 양 끝 투 포인터인지 체크해볼 것!
- [] "연속"이라는 말이 없다.
- [] "두 수 / 세 수" 조합이다.
- [] 정렬해도 답이 바뀌지 않는다.
- [] 합 비교로 포인터를 한쪽씩 움직일 수 있을 것 같다.

위에 "예"가 많으면 양 끝 투 포인터!!

---

## 3. DFS와 BFS

> 핵심 키워드
> - "탐색" 문제
> - 연결 관계
> - 방문 처리(visited)가 반드시 필요
> - DFS나 BFS냐에 따라 **탐색 순서의 의미가 달리짐**

### 1) DFS (Depth-First Search, 깊이 우선 탐색)

#### 언제 쓰는 것인가!
- 한 경로를 **끝까지 깊게** 들어가 봐야할 때
- 모든 경우의 수를 탐색해야 할 때
- "갈 수 있는지 없는지", "연결되어 있는지" 판단
- 조합 / 백트리킹 / 재귀 구조가 자연스러울 때

#### 대표 문제 유형
- 연결 요소 개수
- 경로 존재 여부
- 모든 경우의 수 탐색
- 백트래킹 문제
- 트리 순회

예
- 백준 1260, 11724, 2667, 15649

#### 핵심 개념!
- **한 방향으로 갈 수 있을 때까지 간다!**
- 더 이상 못 가면 *되돌아온다**
- 스택 구조 (재귀 = 암묵적 스택)

#### DFS 기본 패턴 - 재귀
```js
function dfs(node) {
    visited[node] = true;

    for(const next of graph[node]) {
        if(!visited[next]) {
            dfs(next);
        }
    }
}
```

특징
- 구현 직관적
- 코드 짧음
- 재귀 깊이가 깊어지면 스택 오버플로우 위험


#### DFS 기본 패턴 - stack
```js
const stack = [start];
visited[start] = true;

while(stack.length > 0) {
    const cur = stack.pop();

    for(const next of graph[cur]) {
        if(!visited[next]) {
            visited[next] = true;
            stack.push(next);
        }
    }
}
```

언제 재귀 대신 스택을 쓰는가!
- 노드 수가 많아 재귀 깊이가 위험할 때
- JS 환경에서 콜스택 제한이 걱정될 때


---

### 2) BFS (Breadth-First Search, 너비 우선 탐색)

#### 언제 쓰는 것인가!
- **최단 거리 / 최소 횟수**를 구할 때
- 단계(Level) 개념이 있을 때
- "몇 번 만에 도달하는가?"
- 먼저 도착한 것이 의미가 있을 때

#### 대표 유형 문제
- 최단 경로
- 미로 탐색
- 숨바꼭질
- 거리 계산 문제

예:
- 백준 2178, 1697, 7576, 7569

#### BFS의 핵심 개념
- **가까운 것부터 차례대로 탐색**
- 큐(Queue) 구조
- 처음 방문했을 때가 최단 거리

#### BFS 기본 패턴
```js
const queue = [];
queue.push(start);
visited[start] = true;
dist[start] = 0;

while(queue.length > 0) {
    const cur = queue.shift();

    for(const next of graph[cur]) {
        if(!visited[next]) {
            visited[next] = true;
            dist[next] = dist[cur] + 1;
            queue.push(next);
        }
    }
}
```

특징
- visited 체크를 **큐에 넣을 때**한다.
- dist 배열로 거리 관리 가능
- JS에서는 `shift()` 때문에 큐 구현 주의 필요

---

