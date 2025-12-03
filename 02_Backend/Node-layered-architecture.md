# Node Layered Architecture
Node.js(Express) 에서 가장 많이 쓰는 클린 구조(레이어드 아키텍처)

## 1. Route (Controller)

### 하는 일
- 클라이언트 요청 받기
- URL 매핑 (`GET /users`)
- body, params, query 가져오기
- 간단한 유효성 검사
- service로 넘기고 결과를 반환

### 예시
```ts
// routes/user.route.ts
import { Route } from 'express';
import userService from "../services/user.service";

const router = Router();

router.get("/", async (req, res) => {
    const users = await userService.getUserList();
    res.json(users);
});

export default router;
```

---

## 2. Service

### 핵심 로직 담당
- 조건 판단
- 여러 repository 조합
- 데이터 조작
- 실패/성공 처리
- 예외 처리
- **비즈니스 규칙이 들어가는 곳**

### 예시
```ts
// services/user.service.ts
import userRepository from "../repositories/user.repository";

async function getUserList() {
    const users = await userRepository.findAll();
    
    // 로직이 있으면 여기서 처리
    return users.map(u => ({
        ...u,
        isActive: u.last_login != null
    }))
}

export default { getUserList }
```

---

## 3. Repository (DAO, DB Access Layer)
### 진짜 DB 쿼리하는 곳
- SELECT / INSERT / UPDATE / DELETE
- 트랜잭션 실행
- SQL(PostgreSQL, MYSQL 등) 직접 작성

### 예시
```ts
// repositories/user.repository.ts
import db from "../db"; // DB Connection

async function findAll() {
    const result = await db.query(`SELECT * FROM users`);
    return result.rows;
}

export default { findAll }
```

---

## 4. 구조를 나누는 이유
### 1) 유지보수 극대화
- URL이 바뀌어도 service는 영향 없음.
- DB 구조 바뀌어도 route는 영향 없음.
- 특정 로직만 교체하기가 매우 쉬움.

### 2) 테스트 코드 작성 쉬움
- service만 단독으로 테스트 가능
- repository를 mock 처리하기 매우 쉬움

### 3) 대규모 프로젝트에서 표준 패턴

---

## 5. 폴더 구조 예시
### 예시 1
```pgsql
src/
  routes/
    user.route.ts
    estimate.route.ts
  services/
    user.service.ts
    estimate.service.ts
  repositories/
    user.repository.ts
    estimate.repository.ts
  dtos/
    user.dto.ts
    estimate.dto.ts
  db/
    index.ts
  app.ts
  server.ts
```

### 예시 2
```pgsql
src/
    users/
        user.route.ts
        user.service.ts
        user.repository.ts
        user.dto.ts
        user.model.ts
```

---
## 6. 파일명 작명을 `user.route.ts` / `user.service.ts` / `user.repository.ts` 처럼 하는 이유.
### 폴더 구조보다는 파일명으로 역할을 명확히 보이게 하려고
Node.js는 구조가 개발자 자유도가 높음
-> 폴더 위치만으로 "이 파일이 서비스인지, 라우트인지" 파악이 어려움.

### TypeScript나 Node는 "네임스페이스"가 없어서 파일명으로 표현.
Java(Spring), C# 같은 언어는 **클래스 이름 + 패키지**로 역할 명확히 구분.

### VSCode 검색·탭 관리가 쉬워짐.

---
## 7. Node.js 에서도 Entity와 DTO 개념이 있다!

### Entity / Model
- DB 테이블과 1:1에 가까운 구조
- 실제 저장되는 데이터 구조
- 비밀번호, created_at, updated_at 등 "원본 데이터" 포함
- 파일명: `user.entity.ts` 또는 `user.model.ts`


### DTO (Data Transfer Object)
- 요청(Request) 데이터 타입 정의
- 응답(Response) 데이터 타입 정의
- 검증(validation)과 파싱에 사용
- API에서 입출력 형태를 일정하게 유지하는 역할
- 파일명: `user.data.ts` 

### 예시

**Entity (DB 모델)**
```ts
// user.entity.ts
export interface UserEntity {
    id: number;
    email: string;
    password: string;
    name: string;
    created_at: Date;
}
```

**DTO (입출력 구조)**
```ts
export interface CreateUserDto {
    email: string;
    name: string;
    password: string;
}

export interface UserResponseDto {
    id: number;
    email: string;
    name: string;
    createdAt: string;
}
```

**Repository**
```ts
// user.repository.ts
import db from "../db";
import { CreateUserDto } from "./user.dto";

export async function insert(dto: CreateUserDto) {
  const result = await db.query(
    `INSERT INTO users (email, name, password)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [dto.email, dto.name, dto.password]
  );
  return result.rows[0];
}

export default { insert };
```

**Service**
```ts
// user.service.ts
import userRepository from "./user.repository";
import { CreateUserDto, UserResponseDto } from "./user.dto";

export async function create(dto: CreateUserDto): Promise<UserResponseDto> {
  const entity = await userRepository.insert(dto);

  return {
    id: entity.id,
    email: entity.email,
    name: entity.name,
    createdAt: entity.created_at.toISOString(),
  };
}

export default { create };
```

**Route**
```ts
// user.route.ts
import { Router } from "express";
import userService from "./user.service";

const router = Router();

router.post("/", async (req, res) => {
  const user = await userService.create(req.body);
  res.json(user);
});

export default router;
```