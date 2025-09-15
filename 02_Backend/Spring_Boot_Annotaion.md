# Spring Boot Annotation Cheat Sheet
> 실무에서 자주 쓰이는 Annotaion 위주로 의미 -> 언제 쓰는가? -> 간단 예제 순서로 정리.

## 목차
- [1. 스테레오타입 & DI](#1-스테레오타입--di)
- [2. 웹 계층 (MVC/REST)](#2-웹-계층-mvc--rest)
- [3. 요청 바인딩 & 검증(Validation)](#3-요청-바인딩--검증validation)
- [4. 트랜잭션](#4-트랜잭션)
- [5. JPA & 데이터 접근](#5-jpa--데이터-접근)
- [6. 설정/구성](#6-설정구성)
- [7. 스케줄링/비동기/캐시](#7-스케줄링비동기캐시)
- [8. 시큐리티](#8-시큐리티security)
- [9. 직렬화/Jackson](#9-직렬화--jackson)
- [10. 테스트](#10-테스트-test)
- [11. 로깅/Lombok](#11-로깅logginglombok)
- [12. 문서화(OpenAPI/Swagger)](#12-문서화openapiswagger)
- [부록: 메타 애노테이션](#부록-메타-annotation)

---

## 1. 스테레오타입 & DI

### 1. `@RestController`, `@Controller`
- 의미: 웹 컨트롤러, `@RestController = @Controller + @ResponseBody`.
- 언제: JSON 응답이면 `@RestController`, 템플릿/뷰면 `@Controller`
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping("/{id}")
    public UserDto get(@PathVariable Long id) { ... }
}
```

### 2. `@Service`, `@Repository`, `@Component`
- 의미: 계층 구분 및 빈 등록
- 언제: 도메인 로직은 `@Service`, DB 접근은 `@Repository`, 그 외는 `@Component`
```java
@Service
public class UserService { ... }

@Repository
public interface UserRepository extends JpaRepository<User, Long> { }
```

### 3. DI 관련: `@Autowired`, `@Qualifier`, Lombok `@RequiredArgsConstructor`
- 의미: 의존성 주입, 생성자 주입 권장.
```java
@Service
@RequiredArgsConstructor
public class OrderService {
    private final PaymentPort paymentPort; // 생성자 주입
}
```

---

## 2. 웹 계층 (MVC / REST)

### 1. `@RequestMapping` 및 축약 Annotation
- 의미: HTTP 매핑.
- 언제: 메서드별 HTTP 지정.
```java
@GetMapping("/items") // 조회
@PostMapping("/items") // 생성
@PutMapping("/items/{id}") // 전체 수정
@PatchMapping("/items/{id}") // 부분 수정
@DeleteMapping("/items/{id}") // 삭제
```

### 2. `@PathVariable`, `@RequestParam`, `@RequestBody`, `@RequestHeader`
- `@PathVariable`
    > - 경로 변수를 표시하기 위해 메서드에 **매개변수에 사용**
    > - 경로 변수는 **중괄호로 둘러싸인 값**을 나타낸다.
    > - URL 경로에서 변수 값을 추출하여 매개변수에 할당.
    > - 기본적으로 **경로 변수는 반드시 값을 가져야 하며, 값이 없는 경우 404 오류 발생**
- `@RequestParam`
    > - 파라미터 이름으로 바인딩.
    > - `/request-param?username=yum&age=20` 으로 요청이 들어오면, `username=yum, age=20`이 바인딩 됨.
    > - 만약 HTTP 파라미터 이름과 메서드 파라미터 이름이 동일하다면 `value`는 생략 가능.
- `@RequestBody`
    > - 해당 Annotaion이 적용되면, `@Controller`가 적용되었더라도 View 조회를 무시하고, HTTP message body에 직접 반환되는 string 값을 입력한다.
- `@RequestHeader`
    > - header의 원하는 데이터 추출 가능.

```java
@GetMapping("/search")
public List<Item> search(@RequestParam String q) { ... }

@GetMapping("/hello")
public String hello(@RequestParam("username") String name) {
    return "Hello " + name;
}
// 요청 /hello?username=taehan
// 메서드 변수 이름은 username, 파라미터 이름은 name -> 불일치하므로 username을 명시해야 함!

@GetMapping("/hello")
public String hello(@RequestParam String username) {
    return "Hello " + username;
}
// 요청: /hello?username=taehan
// 메서드 변수 이름도 username, 파라미터 이름도 username -> 일치하므로 username을 따로 쓰지 않아도 됨.

@GetMapping("/{id}")
public Item get(@PathVariable Long id) { ... }

@PostMapping
public Item create(@RequestBody @Valid CreateItemReq req) { ... }

@GetMapping("/agent")
public String ua(@RequestHeader("User-Agent") String ua) { ... }
```

### 3. `@ResponseStatus`, `@ExceptionHandler`, `@RestControllerAdvice`
- 의미: 예외 처리 및 상태 코드 제어.
- `@ResponseStatus`: HTTP 응답 상태 코드를 지정할 때 사용.
- `@ExceptionHandler`: 특정 예외가 발생했을 때 실행할 **예외 처리 메서드**를 지정하는 annotation.
- `@RestConrollerAdvice`
    > - 전역 예외 처리, 공통 응답 변환, 바인딩 관련 처리 등을 지원하는 annotation.
    > - `@ControllerAdvice` + `@ResponseBody`의 조합.
    > - 즉, 컨트롤러 단위가 아니라 **프로젝트 전체 컨트롤러에 적용되는 전역 예외 처리기**가 됨.
```java
@ResponseStatus(HttpStatus.NOT_FOUND)
class NotFoundException extends RuntimeException { }
// 이 예외가 던져지면, 자동으로 HTTP 404 상태 코드를 응답에 넣어줌!
// 즉, 이 예외가 발생하면 404 에러로 응답해라. 라는 뜻.

@RestControllerAdvice // 이 클래스 안에서 정의한 `@ExceptionHandler` 메서드들은 모든 컨트롤러에 공통적으로 적용됨.
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public ErrorRes handle(NotFoundException e) {
        return new ErrorRes("NOT_FOUND", e.getMessage());
    }
    // `NotFoundException`이 발생하면 이 메서드가 실행되고, `ErrorRes` 객체를 JSON으로 리턴.
}
```

---

## 3. 요청 바인딩 & 검증(Validation)

### 1. `@Valid`, `@Validated` + **Jakarta Validation**
```java
public record CreateUserReq(
    @NotBlank String email,
    @Size(min = 8) String password
) {}

@PostMapping("/users")
public User create(@RequestBody @Valid CreateUserReq req) { ... }
```

- 그룹 검증이 필요하면 `@Validated(Group.class)` 사용.
```java
// 1. 그룹 인터페이스 정의
public interface OnCreate {}
public interface OnUpdate {}

// 2. DTO에 그룹 지정
public record UserReq(
    @NotBlank(groups = OnCreate.class) String email,

    @Size(min = 8, groups = {OnCreate.class, OnUpdate.class})
    String password
) {}
// email -> 회원가입할 때만 필수 (OnCreate)
// password -> 회원가입, 수정 모두 검증 (OnCreate, OnUpdate)

// 3. 컨트롤러에서 @Validated와 그룹 지정
@RestController
@RequestMapping("/users")
public class UserController {

    // 회원가입
    @PostMapping
    public String create(@RequestBody @Validated(OnCreate.class) UserReq req) {
        return "Created user: " + req.email();
    }

    // 비밀번호 변경
    @PutMapping("/{id}")
    public String update(@PathVariable Long id,
                         @RequestBody @Validated(OnUpdate.class) UserReq req) {
        return "Updated user: " + id;
    }
}
```


---

## 4. 트랜잭션

---

## 5. JPA & 데이터 접근

---

## 6. 설정/구성

---

## 7. 스케줄링/비동기/캐시

---

## 8. 시큐리티(Security)

---

## 9. 직렬화 / Jackson

---

## 10. 테스트 (Test)

---

## 11. 로깅(Logging)/Lombok

--- 

## 12. 문서화(OpenAPI/Swagger)

---

## 부록: 메타 annotation