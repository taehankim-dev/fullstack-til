# PostgreSQL 기본 인덱스 전략

> 목표: "언제, 어떤 인덱스를, 왜 거는지"를 스스로 판단할 수 있게 정리하기

---

## 0. 인덱스란?
- **인덱스(Index)**는 테이블의 데이터를 빠르게 찾기 위한 "추가 자료구조"
- 인덱스가 없으면 PostgreSQL은 조건에 맞는 행을 찾기 위해 **테이블 전체를 훑는* 경우가 많음. (Sequential Scan / Seq Scan)
- 인덱스가 있으면 PostgreSQL은 인덱스를 먼저 보고, 필요한 행이 있는 위치로 빠르게 이동 가능. (Index Scan / Index Only Scan 등)

### 인덱스가 생기면 무엇이 달라지나?
- **SELECT(조회)**: 빨라질 가능성이 큼.
- **INSERT/UPDATE/DELETE(쓰기)**: 대체로 느려짐 (인덱스도 함께 갱신해야 해서)
- **디스크/메모리 사용량 증가**: 인덱스 자체도 저장 공간이 필요

> 결론: 인덱스는 "무조건 많이"가 아니라 "필요한 곳에 정확히"거는 게 핵심!

---

## 1. PostgreSQL에서 가장 기본이 되는 인덱스: B-Tree

PostgreSQL에서 기본 인덱스는 **B-Tree**.

### B-Tree가 잘하는 것
- `=` (동등 조건)
- `<, <=, >, >=` (범위 조건)
- `BETWEEN`
- `ORDER BY` + `LIMIT` 같은 정렬 최적화(상황에 따라)

즉, 대부분의 일반적인 조회 패턴은 **B-Tree로 커버** 가능.

---

## 2. "언제 인덱스를 걸어야 하나?" 기본 판단 기준
아래는 실무에서 가장 자주 쓰는 "기본 인덱스 후보"

### 2.1 WHERE 조건에 자주 등장하는 컬럼

#### 예시
```sql
SELECT * FROM users WHERE email = 'a@b.com';
```
- `email`로 자주 조회한다면 인덱스 후보.

```sql
CREATE INDEX idx_users_email ON users(email);
```
- 특히 "정확히 1명을 찾는 조회"(email, user_id 같은)는 인덱스 효율이 매우 좋음.

---

### 2.2 JOIN에 사용되는 컬럼 (외래키 컬럼 포함)
예시
```sql
SELECT *
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE u.id = 10;
```
- 보통 `users.id`는 PK라서 이미 인덱스가 있음.
- 하지만 `orders.user_id`는 **그냥 컬럼일 뿐**이라, 인덱스가 없으면 JOIN이 느려질 수 있음.

```sql
CREATE INDEX idx_orders_user_id ON orders(user_id);
```

* 중요 포인트
- PostgreSQL에서 `FOREIGN KEY`를 만든다고 해서 **자동으로 인덱스가 생성되지 않음**
- 따라서 JOIN 성능을 위해 FK 컬럼에는 인덱스를 직접 만드는 습관이 중요.

---

### 2.3 ORDER BY + LIMIT 조합이 자주 나올 때
예시
```sql
SELECT *
FROM estimates
ORDER BY created_at DESC
LIMIT 20;
```
- 최신 20개 같은 조회는 굉장히 흔함.
- `created_at`에 인덱스가 있으면 정렬 부담을 줄일 수 있음.

```sql
CREATE INDEX idx_estimates_created_at_desc
ON estimates(created_at DESC);
```

- 단, 데이터 분포/쿼리 패턴에 따라 PostgreSQL이 인덱스를 쓰지 않을 수 있음.
-> 그래서 **EXPLAIN ANALYZE로 확인**하는 습관 중요!

---

### 2.4 날짜/시간 기반 범위 조회가 많을 때
예시
```sql
SELECT *
FROM sensor_logs
WHERE created_at >= '2025-12-01'
AND created_at < '2025-12-02';
```
- 로그/이력/센서 데이터는 "기간 조회"가 많음.
- 이런 경우 `created_at` 인덱스는 효과가 큰 편.

```sql
CREATE INDEX idx_sensor_logs_created_at
ON sensor_logs(created_at);
```

---

## 3. "인덱스가 의미 없는/손해가 되는" 대표 케이스
인덱스는 비용이 있는 구조라서, 아래 케이스는 조심해야 함!

### 3.1 테이블 자체가 너무 적은 경우
- row 수가 아주 적은 테이블(예: 30~100행)
- 코드 테이블 / 설정 테이블
이 경우는 전체 스캔이 더 빠른 경우가 많음.

### 3.2 값 종류가 너무 적은 컬럼 (선택도 낮음)
예: `status`가 `Y/N` 또는 `0/1` 수준인 컬럼
- 값의 종류가 적으면, 조건으로 걸러도 결국 대부분의 row를 읽어야 해서 인덱스 이점이 작음.
- PostgreSQL이 판단했을 때 "어차피 많이 읽을거면 Seq Scan이 낫다"라고 결정 가능.
> 선택도(Selectivity)가 낮은 컬럼은 단독 인덱스 효율이 낮은 편.

### 3.3 쓰기(INSERT/UPDATE/DELETE)가 매우 많은 테이블
- 인덱스는 "조회는 빠르게" 하지만 "쓰기 성능은 떨어뜨림".
- 예: 센서 원천 로그(raw logs), 이벤트 스트림 저장 테이블
  -> 인덱스를 최소화하거나, 필요한 인덱스만 엄격히 유지하는 전략 필요.

---

## 4. 인덱스 설계의 핵심: "패턴"을 기준으로 만든다.
인덱스를 잘 설계한다는 것은 **"컬럼 하나를 보고 판단하는 것"이 아니라, 실제로 자주 실행되는 쿼리의 형태(패턴)을 기준으로 판단하는 것**

즉, 다음 질문에 답할 수 있어야 함.
- 이 테이블은 **어떤 조건으로 가장 많이 조회되는가?**
- 단건 조회인가, 목록 조회인가?
- 최신순 정렬이 필요한가?
- 특정 사용자/부모 데이터 기준으로 묶어서 보는가?
- 기간(날짜/시간) 조건이 항상 붙는가?

이 질문의 답이 곧 인덱스 설계 기준이 됨.

### 4.1 "WHERE 조건 + ORDER BY + LIMIT" 패턴
- 실무에서 가장 흔한 조화 패턴.

예시
```sql
SELECT *
FROM estimates
WHERE user_id = 10
ORDER BY created_at DESC
LIMIT 20;
```

이 쿼리는 단순히
- `user_id`로 필터링하고
- `created_at` 기준으로 정렬해서
- 일부만 가져오는 구조.

> 이 경우 인덱스는 **쿼리 흐름 그대로** 만들어야 함.
```sql
CREATE INDEX idx_estimates_user_created_desc
ON estimates(user_id, created_at DESC);
```

이 인덱스는
- `user_id`로 먼저 좁히고, 그 안에서 `created_at` 기준 정렬을 빠르게 처리 가능.

---

### 4.2 "부모 -> 자식 조회" 패턴 (FK 기준 조회)
예시
```sql
SELECT *
FROM estimate_items
WHERE estimate_id = 123;
```

이 패턴은
- 부모(estimate) 하나에 딸린 자식(item)을 전부 가져오는 전형적인 구조.

```sql
CREATE INDEX idx_estimate_items_estimate_id
ON estimate_items(estimate_id);
```
- PK가 아닌 쪽(FK)에 인덱스를 거는 것이 핵심
- PostgreSQL은 FK에 인덱스를 자동 생성하지 않으므로 직접 만들어야 함.

---

### 4.3 "기간 조건"이 항상 붙는 로그/이력 패턴
예시
```sql
SELECT *
FROM sensor_logs
WHERE sensor_id = 5
AND created_at >= '2025-12-01'
AND created_at < '2025-12-02';
```

이 경우 조회 패턴은 다음과 같다.
1. 특정 `sensor_id`
2. 특정 기간 범위

```sql
CREATE INDEX idx_sensor_logs_sensor_created
ON sensor_logs(sensor_id, created_at);
```
- `sensor_id`로 먼저 좁히고 그 안에서 날짜 범위를 검색

---

### 4.4 "단건 조회" 패턴 (거의 1행)
예시
```sql
SELECT *
FROM users
WHERE email = 'a@b.com';
```
이 경우는 매우 명확
- 결과는 거의 1건
- 조건은 `=` 하나
> 단일 컬럼 인덱스가 가장 효율적
```sql
CREATE UNIQUE INDEX idx_users_email
ON users(email);
```
- 가능하다면 UNIQUE로 만들어 무결성까지 함께 보장하는 것이 좋음

---

### 4.5 패턴 중심 인덱스 설계의 핵심 요약
- 인덱스는 **컬럼이 아니라 "쿼리"를 보고 만든다**
- 실제로 자주 실행되는 쿼리부터 분석한다.
- WHERE -> ORDER BY -> LIMIT 흐름을 그대로 인덱스로 옮긴다.
- "있으면 좋을 것 같은 컬럼"이 아니라 "실제로 쓰이는 조건"에만 인덱스를 건다. 

---

## 5. 단일 인덱스 vs 복합(Composite) 인덱스

### 5.1 단일 인덱스
```sql
CREATE INDEX idx_users_email ON users(email);
```
- 가장 기본
- 조건이 하나일 때 효과가 좋음.

### 5.2 복합 인덱스 (중요: 컬럼 순서가 성능 결정)
```sql
CREATE INDEX idx_estimates_user_created
ON estimates(user_id, created_at DESC);
```

#### 유리한 예
```sql
-- 1) user_id로 찾고 최신순 정렬
SELECT *
FROM estimates
WHERE user_id = 10
ORDER BY created_at DESC
LIMIT 20;

-- 2) user_id + 기간 조건
SELECT *
FROM estimates
WHERE user_id = 10
AND created_at >= '2025-12-01';
```

#### 불리한 예 (컬럼이 빠지면 활용이 어려움)
```sql
SELECT *
FROM estimates
WHERE created_at >= '2025-12-01';
```

#### "복합 인덱스 순서"를 정하는 기본 규칙
1. WHERE에서 가장 자주 쓰는 "좁혀주는" 컬럼을 앞에
2. 그 다음이 정렬/범위 조건에 쓰이는 컬럼
3. `=` 조건이 앞, 범위 조건이 뒤에 오는게 일반적으로 유리

---

## 6. 자주 쓰는 인덱스 패턴 모음
### 6.1 “특정 사용자 데이터 최신 N개”
```sql
-- 패턴
WHERE user_id = ?
ORDER BY created_at DESC
LIMIT N

-- 인덱스
CREATE INDEX idx_x_user_created_desc
ON x(user_id, created_at DESC);
```

### 6.2 “FK로 자식 테이블 조회”
```sql
-- 패턴
SELECT * FROM estimate_items WHERE estimate_id = ?

-- 인덱스
CREATE INDEX idx_estimate_items_estimate_id
ON estimate_items(estimate_id);
```

### 6.3 “날짜 범위 + 정렬”
```sql
-- 패턴
WHERE created_at BETWEEN A AND B
ORDER BY created_at DESC
LIMIT N

-- 인덱스
CREATE INDEX idx_x_created_at_desc
ON x(created_at DESC);
```

---

## 7. 실제로 PostgreSQL이 인덱스를 쓰는지 확인하는 법 (필수)
### 7.1 EXPLAIN / EXPLAIN ANALYZE
- EXPLAIN은 실행 계획만 보여줘요.
- EXPLAIN ANALYZE는 **실제로 실행**해서 비용/시간/행 수 등을 보여줘요.
```sql
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'a@b.com';
```

### 7.2 결과에서 봐야 할 핵심 단어
- `Seq Scan` : 테이블 전체 훑는 중(인덱스 사용 X)
- `Index Scan` : 인덱스를 사용해서 행 접근
- `Index Only Scan` : 테이블을 거의 안 보고 인덱스만으로 해결(조건이 맞아야 가능)
- `Bitmap Index Scan` / `Bitmap Heap Scan` : 여러 조건을 인덱스로 모아서 처리하는 방식(자주 봄)

> 인덱스는 “걸었다”가 끝이 아니라, **실제로 사용되는지 확인**하는 게 절반이에요.

---

## 8. PostgreSQL에서 “PK/UNIQUE”와 인덱스 관계
### 8.1 PRIMARY KEY
- PK를 만들면 PostgreSQL은 자동으로 유니크 인덱스를 만들어요.
- 그래서 PK 컬럼은 따로 인덱스를 또 만들 필요가 없어요.

### 8.2 UNIQUE 제약
- UNIQUE도 자동으로 인덱스를 만들어요.
```sql
ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
```
> UNIQUE를 걸면 “무결성” + “인덱스”를 동시에 얻는 효과가 있어요.

---

## 9. 실무 체크리스트 (기본 인덱스 전략)

아래는 “테이블 만들고/기능 개발할 때” 바로 적용 가능한 체크리스트예요.

### 9.1 무조건 확인
- [] PK는 무엇인가?
- [] UNIQUE가 필요한 컬럼은 무엇인가? (email, code 등)
- [] FK 컬럼에 인덱스가 있는가? (PostgreSQL은 자동 생성 안 함)
- [] 자주 조회되는 WHERE 조건 컬럼은 무엇인가?
- [] 자주 쓰는 ORDER BY + LIMIT 패턴이 있는가?
- [] 기간(날짜/시간) 범위 조회가 많은가?

### 9.2 만들고 나서 확인
- [] EXPLAIN ANALYZE로 인덱스가 실제로 쓰이는지 확인했는가?
- [] 인덱스를 늘렸더니 쓰기 성능이 악화되진 않았는가?

---

## 10. 요약
- WHERE / JOIN / ORDER BY / 기간 범위 조회가 자주 나오면 인덱스 후보
- FK 컬럼 인덱스는 PostgreSQL에서 자동 생성되지 않으니 직접 만들기
- 복합 인덱스는 컬럼 순서가 핵심
- EXPLAIN ANALYZE로 실제 사용 여부 확인이 필수