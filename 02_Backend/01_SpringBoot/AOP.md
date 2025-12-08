# AOP (관점 지향 프로그래밍)

## 📌 개념 정리
- AOP (Aspect Oriented Programming)
    - "횡단 관심사(Corss-cutting Concern)"를 모듈화하는 기법.
    - 로깅, 보안, 트랜잭션, 캐싱 같은 기능을 **핵심 로직과 분리**해서 재사용 가능하게 만듬.
- 횡단 관심사
    - 여러 계층/메서드에서 공통으로 필요한 기능.
    - 예: 메서드 실행 시간 측정, 권한 체크, DB 트랜잭션 처리, 로그 기록.

---

## 📌 Spring AOP 핵심 키워드
- **Aspect**: 횡단 관심사 모듈 (예: LoggingAspect, SecurityAspect)
- **Join Point**: AOP가 적용 가능한 지점 (메서드 실행 시점 등)
- **Pointcut**: 실제 Aspect를 적용할 위치 지정 (패키지, 어노테이션, 메서드명 패턴 등)
- **Advice**: 언제 실행할지 정의 (Before, After, Around)
- **Weaving**: 핵심 로직 + 횡단 관심사를 합치는 과정
- **프록시(Proxy)**: Spring AOP가 동작하는 방식. (메서드 실행 전에 Aspect 코드 삽입)

---

## 📌 Spring에서 AOP 적용 방식
Spring AOP는 **프록시 기반**으로 동작:
- Bean을 감싸는 Proxy 객체를 만들고,
- 메서드 호출 전/후에 부가 기능을 실행시킨 후,
- 실제 대상(Target) 메서드를 호출.

---

## 📌 실제 예제
1. 로깅 Aspect
```java
@Aspect
@Component
public class LogginAspect {
    @Before("execution(* com.example.service.*.*(..))")
    public void beforeService(JoinPoint jp) {
        System.out.println("[LOG] 호출 메서드 : " + jp.getSignature());
    }

    @AfterReturning(value = "execution(* com.example.service.*.*(..))", returning = "result")
    public void afterService(JoinPoint jp, Object result) {
        System.out.println("[LOG] 결과: " + result);
    }
}
```
- `execution(* com.example.service.*.*(..))`
    -> service 패키지 내 모든 메서드에 적용.

2. 실행 시간 측정 (Around Advice)
```java
@Aspect
@Component
public class TimeAspect {
    @Around("execution(* com.example.controller.*.*(..))")
    public Object measureTime(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();

        Object result = pjp.proceed(); // 실제 메서드 실행

        long end = System.currentTimeMillis();
        System.out.println("[TIME] 실행 시간: " + (end - start) + "ms");

        return result;
    }
}
```

3. 어노테이션 기반 Pointcut
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface LogExecutionTime { }

@Aspect
@Component
public class AnnotationAspect {
    @Around("@annotation(LogExecutionTime)")
    public Object logTime(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.nanoTime();
        Object result = pjp.proceed();
        long end = System.nanoTime();

        System.out.println("[TIME] " + (end - start) + "ns");
        return result;
    }
}
```

```java
@Service
public class ReportService {
    @LogExecutionTime
    public void generateReport() {
        // 보고서 생성 로직
    }
}
```

---

## 📌 Spring 내장 어노테이션도 AOP
- `@Transactional` -> 트랜잭션 경계 설정 (DB 작업 단위 보장)
- `@Async` -> 비동기 실행 (스레드 풀에서 실행)
- `@Cacheable`, `@CacheEvict` -> 메서드 호출 결과를 캐시.
이들은 내부적으로 전부 AOP 프록시로 구현돼 있다.

---

## 📌 주의할 점
1. **자기 자신 호출(Self-invocation) 문제**
    - 같은 클래스 내 메서드에서 호출하면 프록시를 호출하지 않아 AOP가 적용되지 않는다.
    - 해결 -> 구조 분리 또는 `Aspect3` 컴파일 타임 위빙 사용.
2. **프록시 기반 문제**
    - 기본적으로 메서드 실행 시점만 지원.
    - 더 세밀한 제어가 필요하다면 AspectJ를 직접 써야 한다.