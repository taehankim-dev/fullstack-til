# HTTP / HTTPS

## HTTP란?
**웹에서 클라이언트(브라우저·앱)와 서버가 데이터를 주고받는 통신 규칙(프로토콜)**

### 특징
- 요청(request) -> 응답(response) 방식
- 상태를 기억하지 않음(Stateless)
- TCP 위에서 동작
- GET/POST/PUT/DELETE 등의 메서드 사용
- JSON 텍스트 데이터 주로 사용

---

## HTTPS란?
HTTP + SSL/TLS 암호화

- 주소에 https:// 가 붙음.
- 데이터가 암호화됨 -> 중간에서 탈취해도 분석 불가
- 보안 인증서(SSL 인증서) 필요
- 요즘은 HTTPS가 기본 / HTTP는 거의 외부 서비스에서 사용 안 함

### 왜 써야 하나?
- 비밀번호, 토큰, 쿠키 노출 방지
- 중간자 공격(MITM) 차단
- API 서버와 통신 시 신뢰성 확보
- SEO(검색엔진)에도 유리

---

## RESTful API란?

### REST란?
**HTTP 규칙을 최대한 깔끔하게 활용해서 자원을 표현하는 방식**

RESTful API = REST 원칙을 잘 지킨 API 구조

### REST API 핵심 원칙 5가지
1. 자원(Resource)은 URL로 표현
```bash
GET /users
GET /users/1
POST /users
```

2. 행동(Action)은 HTTP 메서드로 표현
```
GET -> 조회
POST -> 생성
PUT -> 전체 수정
PATCH -> 부분 수정
DELETE -> 삭제
```

3. URL은 명사를 사용해야 한다.
- ❌ : `/getUsers`, `/createdUser`
- ⭕ : `/users`
이미 메서드로 행동 표현되니까 URL은 '무엇인지'만 표현.

4. 서버는 Stateless (상태를 기억하지 않음)
- 각 요청은 독립적
- 서버가 이전 요청의 상태를 기억하지 않음
- 인증/사용자 정보는 매 요청마다 헤더(Token)로 전달

5. JSON을 활용한 표준 응답
예:
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "홍길동"
    }
}
```

---

## 추가로 알아볼 내용
1) HTTP Full Cycle
- TLS Handshake
- HTTP/2 vs HTTP/3 차이
- Keep-Alive, 커넥션 수
- CORS 동작 원리
- 쿠키 vs 세션 vs JWT 깊은 이해

2) RESTful → API 디자인 원칙 심화
- 구조적 API 버전 관리
- Error Response 규격
- API 문서화 (OpenAPI/Swagger)
- HATEOAS 개념

3) 추가 CS 개념
- WebSocket & SSE 차이
- MQTT와 HTTP의 차이
- Edge Device 통신 구조
- 백엔드 로드밸런싱, Nginx Reverse Proxy