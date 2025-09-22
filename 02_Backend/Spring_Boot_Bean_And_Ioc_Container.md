# 빈(Bean)과 IoC 컨테이너 동작 원리

## 📌 개념 정리
1. 빈(Bean)
    - Spring IoC 컨테이너가 관리하는 객체.
    - 애플리케이션에서 필요한 컴포넌트(Controller, Service, Repository 등)를 **Spring이 직접 생성·주입·소멸 관리**함.

2. IoC(Inversion of Control, 제어의 역전)
    - 원래는 개발자가 `new`로 객체를 만들고 의존성을 주입해야 하는데, Spring이 대신 관리해줌으로써 **객체 생성/주입의 제어권이 개발자 -> 컨테이너로 역전됨**.

3. DI (Dependency Injection, 의존성 주입)
    - IoC를 구현하는 방식.
    - 필드 주입, setter 주입, 생성자 주입이 있으며, **생성자 주입 권장**.

---

## 📌 IoC 컨테이너
1. 종류
    - `ApplicationContext` 
        - 가장 많이 쓰이는 컨테이너.
        - Bean 관리 + 메시지 소스 + 이벤트 등 부가 기능 지원
    - `BeanFactory`
        - 가장 기본적인 컨테이너. 직접 쓸 일은 거의 없음.

2. 역할
    - Bean 정의(설정) 읽기 (`@Configuration`, `@ComponentScan`, XML 등)
    - Bean 객체 생성.
    - 필요한 곳에 의존성 주입.
    - 라이프사이클 관리 (초기화/소멸 등)

---

## 📌 Bean 등록 방식
1. 컴포넌트 스캔 기반
    - `@Component` 계열 어노테이션을 붙이면 자동으로 빈 등록됨.
    - `@ComponentScan`이 붙은 위치부터 탐색.
```java
// Application
@SpringBootApplication // 내부에 @ComponentScan 포함
public class App { }

// Bean 등록
@Component
public class SmsSender { ... }

@Service
public class UserService { ... }

@Repository
public class UserRepository { ... }
```

2. 자바 설정 클래스 (@Configuration + @Bean)
- 수동으로 Bean 등록 가능. (외부 라이브러리, 커스텀 인스턴스 생성 시 주로 사용)
```java
@Configuraion
public class AppConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
```

3. 프로퍼티 바인딩(@ConfigurationProperties)
- `application.yml` 값을 POJO로 매핑.
```yaml
sms:
    sender: "010-1234-5678"
    apiKey: "my-api-key"
```
```java
@ConfigurationProperties(prefix = "sms")
@Getter @Setter
public class SmsProps {
    private String sender;
    private String apiKey;
}
```

* POJO?
> **Plain Old Java Object**
- 특별한 규칙, 의존성 없이 **순수한 자바 객체**라는 뜻.
- 즉, 그냥 필드 + getter/setter + 생성자 정도만 가진, 단순한 클래스.
```java
public class User {
    private String name;
    private int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() { return name; }
    public int getAge() { return age; }
}
```

> **POJO가 중요한 이유**
- 재사용성 : 프레임워크에 묶이지 않으니까 어디서든 사용 가능.
- 테스트 용이성 : 스프링 컨테이너 없이도 `new` 해서 단위 테스트 가능.
- 유연성 : 프레임워크는 POJO를 그대로 가져다가 동작하게 지원 (스프링 철학 : POJO 프로그래밍)

---

### 📌 Bean 의존성 주입 방식 (DI)
1. 생성자 주입 (권장)
- 장점:
    - `final` 붙여서 불변성 보장.
    - **필수 의존성**을 강제할 수 있음. (생성자 없으면 컴파일 에러)
    - 순환 참조가 있으면 애플리케이션 실행 단계에서 바로 에러 -> 문제 빨리 발견 가능.
    - 테스트 코드에서 객체를 직접 new 해서 주입 가능 (스프링 없는 환경에서도 테스트 쉬움)
```java
@Service
@RequiredArgsConstructor
public class OrderService {
    private final PaymentService paymentService;
}
```

2. 필드 주입 (지양)
- 장점 : 코드 짧고 간단.
- 단점 :
    - `final` 못 붙임 -> 불변성 보장 안 됨.
    - 순환 참조 발생 시 원인 찾기 어려움.
    - 테스트 시 직접 mock 주입하기 힘듦.
    - 스프링 컨테이너 없이는 객체 생성이 불가능해짐(POJO 성 약화).
```java
@Service
public class OrderService {
    @Autowired
    private PaymentService paymentService;
}
```

3. 세터 주입
- 장점 :
    - 주입 대상 **선택적(optional)** -> 나중에 교체 가능.
    - 순환 참조 시 해결책으로 사용하기도 함.
- 단점 :
    - 런타임에 의존성이 바뀔 수 있어서 불변성 떨어짐.
    - 필수 의존성 보장이 안 됨 (세터 안 부르면 null).
- **필수가 아닌 의존성**일 때만 고려.
```java
@Service
public class OrderService {
    private PaymentService paymentService;

    @Autowired
    public void setPaymentService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

---

### 📌 Bean 라이프사이클
1. Bean 생성
2. 의존성 주입
3. 초기화 콜백 (`@PostConstruct` 또는 `InitialzingBean`)
4. 사용
5. 소멸 콜백 (`@PreDestroy` 또는 `DisposableBean`)
```java
@Component
public class InitExample {
    @PostConstruct
    public void init() {
        System.out.println("Bean 초기화!")
    }

    @PreDestroy
    public void destroy() {
        System.out.println("Bean 소멸!")
    }
}
```