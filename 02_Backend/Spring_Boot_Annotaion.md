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

### `@Transactional`
- 의미: 메서드/클래스 단위 트랜잭션 경계
- 팁: 기본 `RuntimeException` 발생 시 롤백. 체크 예외 롤백은 `rollbackFor`.
```java
@Service
@RequiredArgsConstructor
public class WalletService {
    private final WallerRepository repo;

    @Transactional
    public void charge(Long userId, long amount) {
        var wallet = repo.findByUserId(userId).orElseThrow(NotFoundException::new);
        wallet.charge(amount);
    }
}
```

---

## 5. JPA & 데이터 접근

### `@Entity`, `@Table`, `@Id`, `@GeneratedValue`
- `@Entity`: DB 테이블과 매핑되는 JPA 엔티티다 라는 표시.
- `@Table`: 엔티티가 어떤 DB 테이블과 매핑될지 지정.
- `@Id`: 엔티티의 **기본 키(Primary Key)** 지정. 반드시 하나 이상 필요.
- `@GeneratedValue`: 기본 키 값을 자동 생성할 때 사용.
    > 전략 옵션
    > - `GenerationType.IDENTITY` -> DB의 auto_increment 사용
    > - `GenerationType.SEQUENCE` -> DB 시퀀스 사용
    > - `GenerationType.TABLE` -> 별도 키 생성용 테이블 사용
    > - `GenerationType.AUTO` -> DB 방언에 맞춰 자동 선택
```java
@Entity
@Table(name = "users")
@Getter @Setter
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String email;

  private String password;
}
```

### 관계 매핑 : `@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany`, `@JoinColumn`
```java
@Entity
public class Order {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

#### ※ `fetch` 는 로딩 전략임!
1) 즉시 로딩 (EAGER)
- 관계된 엔티티를 **즉시 함께 조회**
- `@ManyToOne(fetch = FetchType.EAGER)`
- 예시
```sql
select u.*, t.*
from user u
join team t on u.team_id = t.id
```
- 장점: 코드에서 바로 `user.getTeam()` 해도 이미 데이터가 있음.
- 단점: 불필요하게 JOIN을 많이 날려서 성능 문제가 생길 수 있음.

2) 지연 로딩 (LAZY)
- 관계된 엔티티를 **실제로 접근할 때 조회**
- `@ManyToOne(fetch = FetchType.LAZY)`
- 처음에는 프록시 객체(가짜)만 넣어둠.
- `user.getTeam().getName()` 같이 team 데이터를 시제로 사용하려고 하면 그때 SELECT 쿼리 실행.
```java
User user = userRepository.findById(1L).get(); // team은 아직 안 불러옴.
Team team = user.getTeam();                    // 프록시 객체
String name = team.getName();                  // 여기서 DB 조회 발생
```

### 스프링 데이터: `@EnableJpaRepositories`, `JpaRepository`
```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

---

## 6. 설정/구성

### `@Configuration`, `@Bean`
- `@Configuration`: **설정 클래스임을 표시**. 이 클래스 안에서 **스프링 빈**을 등록할 수 있음.
- `@Bean`: **메서드 레벨**에서 사용. 해당 메서드의 리턴 객체르르 **스프링 컨테이너가 관리하는 빈(bean)**으로 등록.
```java
@Configuration
public class AppConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
```

### `@ConfigurationProperties` (+ `@EnableConfigurationProperties`)
- 의미: yml/properties를 타입 세이프하게 바인딩.
- `@ConfigurationProperties`: 
    - 외부 설정 파일(`application.yml`, `application.properties`)에 정의된 값을 **자바 객체 필드로 자동 매핑**해줌.
    - 보통 `prefix` 속성을 붙여서 특정 그룹만 매핑.
- `@EnableConfigurationProperties`:
    - `@ConfigurationProperties` 클래스가 실제로 스프링 빈으로 등록되도록 활성화하는 어노테이션.
    - 보통 `@SpringBootApplication` 이나 `@Configuration` 클래스에 붙임.

```java
@ConfigurationProperties(prefix = "sms")
@Getter @Setter
public class SmsProps {
    private String sender;
    private String apiKey;
}

@Configuration
@EnableConfigurationProperties(SmsProps.class)
class PropsConfig { }
```

### `@Value`
- **단일 설정 값**을 주입할 때 사용.
- `${...}` 안에 `application.yml` / `application.properties` 키를 넣어 쓰는 방식.
```java
@Value("${jwt.secret}")
private String jwtSecret;
```

### 프로파일: `@Profile("dev")`
- 특정 환경(Profile)에서만 해당 빈을 등록하도록 제한하는 어노테이션.
- `spring.profiles.active` 값과 매칭되어야 동작.
```java
@Profile("dev")
@Configuration
class DevOnlyConfig {...}
```

---

## 7. 스케줄링/비동기/캐시
### `@EnableScheduling`, `@Scheduled`
- `@EnableScheduling`
    - **스케줄링 기능을 켜주는 스위치**
- `@Scheduled`
    - **스케줄링할 메서드**에 붙이는 어노테이션.
- [Spring Batch vs @Scheduled](./Spring_Boot_Batch_verse_Scheduled.md)

```java
@EnableScheduling
@SpringBootApplication
public class App { }

@Component
class Housekeeping {
    @Scheduled(cron = "0 0 * * * *") // 매 정시
    public void clean() { ... }
}
```

* `@Scheduled` 사용 방법
```java
// 1) 고정 주기 실행
@Scheduled(fixedRate = 5000) // 5초마다 실행
public void job1() {
    System.out println("5초마다 실행")
}

// ---

// 2) 고정 딜레이 실행
@Scheduled(fixedDelay = 3000) // 3초 쉬고 다시 실행
public void job2() {
    System.out.println("이전 실행 끝난 뒤 3초 후 실행")
}

// ---

// 3) 크론 표현식
@Scheduled(cron = "0 0 9 * * *") // 매일 오전 9시에 실행
public void job3() {
    System.out.println("매일 아침 9시에 실행!")
}
```

### `@EnableAsync`, `@Async`
- `@EnableAsync`
    - 프로젝트에서 **비동기 기능을 켜는 스위치**
- `@Async`
    - **해당 메서드를 별도 스레드에서 실행**하게 해줌 (호출 즉시 리턴, 백그라운드에서 실행)
```java
@EnableAsync
@Configuration
class AsyncConfig { }

@Service
class MailService {
    @Async
    public void sendAsync(Mail mail) { ... }
}
```

### `@EnableCaching`, `@Cacheable`, `@CacheEvict`
- `@EnableCaching`
    - **스프링에서 캐싱 기능을 활성화**하는 스위치.
    - 보통 `@SpringBootApplication` 클래스나 `@Configuration` 클래스에 붙임.
- `@Cacheable`
    - **메서드 실행 결과를 캐시에 저장**하고, 같은 파라미터로 다시 호출되면 DB/로직 실행없이 캐시 값 반환.
- `@CacheEvict`
    - **캐시를 지울 때 사용. (데이터 변경 시 캐시 무효화)

```java
@EnableCaching
@Configuration
class CacheConfig { }

@Service
class ProductService {
    @Cacheable(cacheNames = "product", key = "#id") // product 캐시에 id를 key값으로 캐시 저장.
    public Product get(Long id) { ... }

    @CacheEvict(cacheNames = "product", key = "#id") // product의 key 값에 해당하는 캐시 삭제.
    public void invalidate(Long id) { ... }
    // allEntries = true -> 캐시 전체 삭제.
}
```

---

## 8. 시큐리티(Security)

### `@EnableWebSecurity`, `@Configuration`, `SecurityFilterChain`
- `@EnableWebSecurity`
    - **스프링 시큐리티를 활성화**하는 스위치
    - Web 보안 설정(인증/인가)을 켜고, 정의한 보안 설정을 적용 가능하게 해줌.
- `@Configuration`
    - 이 클래스가 **설정 클래스**임을 의미.
    - 스프링이 이 클래스 안의 `@Bean` 메서드들을 읽어 빈으로 등록.
    - 보안 설정 클래스에도 붙여야 시큐리티 관련 Bean 등록 가능.
- `SecurityFilterChain`
    - **Spring Security의 필터 체인(보안 규칙 모음)을 정의하는 Bean.**
    - `@Bean`으로 등록해야 하고, 여기서 **URL 별 접근 권한, 로그인 방식** 등을 설정.

```java
@EnableWebSecurity
@Configuration
public class SecurityConfig {
    @Bean
    SecurityFilterChain filter(HttpSecurity http) throws Exception {
        return http
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth.requestMatchers("/public/**").permitAll()
                                            .anyRequest().authenticated()
        )
        .httpBasic(basic -> {})
        .build()
    }
}
```

### 메서드 보안: `@EnableMethodSecurity`, `@PreAuthorize`, `@PostAuthorize`
- `@EnableMethodSecurity`
    - **메서드 단위에서 권한 검사 기능을 켜주는 스위치**
    - 컨트롤러, 서비스 계층 메서드 위에 `@PreAuthorize`, `@PostAuthorize` 등을 쓸 수 있게 해줌.
    - 보안 설정 클래스에 붙임.
- `@PreAuthorize`
    - **메서드 실행 전에 권한/조건을 검사**하는 어노테이션.
    - SpEL(스프링 표현식 언어)로 조건을 작성.
- `@PostAuthorize`
    - **메서드 실행이 끝난 후(결과 반환 직전) 권한을 검사**하는 어노테이션.
    - 즉, **실행은 일단 시키고**, 반환값을 검사해서 조건에 맞지 않으면 `AccessDeniedException`을 던짐.

```java
@EnableMethodSecurity
@Configuration
class MethodSecurityConfig { }

@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { ... }

@PostAuthorize("returnObject.username == authentication.name")
public User getUser(Long id) {
    // DB에서 유저 찾기 (실행은 됨)
    return userRepository.findById(id).orElseThrow();

    // 로그인한 사용자가 본인 데이터일 때만 결과 반환.
    // 다른 사람 데이터면 이미 조회는 됐지만, 반환 전에 Security가 막아서 `403 Forbidden` 발생.
}
```


---

## 9. 직렬화 / Jackson(ObjectMapper)
> 직렬화(Serialization) : 자바 객체 -> JSON 문자열
```java
User user = new User("taehan", "1234");
String json = objectMapper.writeValueAsString(user);
// 결과: {"username":"taehan","password":"1234"}
```
> 역직렬화(Deserialization) : JSON 문자열 -> 자바 객체
```java
String json = "{\"username\":\"taehan\",\"password\":\"1234\"}";
User user = objectMapper.readValue(json, User.class);
```
> Jackson?
> - 스프링 부트에서 **기본 JSON 변환기로 Jackson(ObjectMapper)**를 사용하기 때문

### `@JsonProperty`, `@JsonIgnore`, `@JsonInclude`
- `@JsonProperty`
    - JSON 필드 이름과 **자바 필드/메서드 이름을 매핑**할 때 사용.
    - 자바 변수명과 JSON 키가 다를 때 유용.
- `@JsonIgnore`
    - 특정 필드를 **JSON 변환에서 무시**
    - 민감정보(비밀번호, 토큰 등) 숨길 때 자주 사용.
- `@JsonInclude`
    - 특정 조건에 맞을 때만 필드를 JSON에 포함.
    - 옵션 예시:
        - `Include.NON_NULL`: null 값은 제외
        - `Include.NON_EMPTY`: null, 빈 문자열, 빈 리스트 다 제외
        - `Include.ALWAYS`: 항상 포함

```java
public record UserRes(
    @JsonProperty("user_id") Long id, // JSON : { "user_id" : 1 } , JAVA : userid = 1
    String email,
    @JsonIgnore String password // JSON에 password 있어도 무시.
) {}

@JSONInclude(JsonInclude.Include.NON_NULL)
public class User {
    private String username;
    private String nickname; // null이면 JSON에 안 나옴.
}
```

---

## 10. 테스트 (Test)

---

## 11. 로깅(Logging)/Lombok

--- 

## 12. 문서화(OpenAPI/Swagger)

---

## 부록: 메타 annotation