# Spring Boot 자동 설정 (@SpringBootApplication 내부 동작)

## 📌 @SpringBootApplication 이란?
```java
@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }
}
```
- 이 한 줄이 사실은 **3가지 어노테이션의 합성(meta-annotaion)**
    1. `@SpringBootConfiguration`
        -> 내부적으로 `@Configuration` -> **Bean 설정 클래스**임을 표시.
    2. `@EnableAutoConfiguration`
        -> `META-INF/spring.factories`를 읽어 자동 설정 클래스들을 로드.
    3. `@ComponentScan`
        -> 현재 패키지와 하위 패키지에서 `@Component` 계열(@Service, @Repository 등) Bean 스캔.

---

## 📌 자동 설정(EnableAutoConfiguration) 동작 원리
Spring Boot는 **클래스패스에 있는 라이브러리를 보고 자동으로 Bean을 구성**

### 과정
1. `spring.factories` 파일 로드
    - 라이브러리별로 `META-INF/spring.factories`에 자동 설정 클래스 등록.
    - 예: `spring-boot-autoconfigure` JAR 안에 있음.
    ```properties
    # spring.factories 예시
    org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
    org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,\
    org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,\
    org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration
    ```

2. `@ConditionalOnClass`, `@ConditionalOnMissingBean` 조건 확인
    - 예: HikariCP 라이브러리가 있으면 `DataSourceAutoConfiguration` 적용.
    - 개발자가 직접 `DataSource`를 정의하면 자동 설정은 무시됨.

3. 최종적으로 ApplicationContext에 Bean 등록.

---

## 📌 주요 자동 설정 예시
- JPA: `spring-boot-starter-data-jpa` 를 의존성에 추가하면
    - `EntityManagerFactory`, `DataSource`, `JpaTransactionManager` 자동 등록.
- Web: `spring-boot-starter-web` 추가하면
    - `DispatcherServlet`, `MessageConverter`, `WebMvcConfigurer` 자동 등록.
- Security: `spring-boot-starter-security` 추가하면
    - `SecurityFilterChain` 기본 설정 Bean 등록.
- Redis: `spring-boot-starter-data-redis` 추가하면
    - `LettuceConnectionFactory`, `RedisTemplate` 자동 등록.

---

## 📌 자동 설정 제어하기

1. 특정 자동 설정 끄기
```java
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class App { }
```

2. 조건부 로딩 예시
```java
@Configuration
@ConditionalOnClass(name = "com.zaxxer.hikari.HikariDataSource")
public class CustomDataSourceConfig {
    @Bean
    public DataSource dataSource() { return new HikariDataSource(); }
}
```

3. properties로 제어
```yaml
spring:
    datasource:
        url: jdbc:postgresql://localhost:5432/mydb
        username: user
        password: pass
```

---

## 📌 실행 흐름 요약

1. `SpringApplication.run()` 실행
2. `@SpringBootApplication` 해석
    - `@ComponentScan` -> Bean 스캔
    - `@EnableAutoConfiguration` -> spring.factories 기반 자동 설정
    - `@Configuration` -> 명시적 Bean 등록
3. 최종 ApplicationContext 완성