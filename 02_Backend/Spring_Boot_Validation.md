# Validation 심화 (@Valid vs @Validated, 커스텀 Validator)

## 📌 Bean Validation 이란?
- Jakarta Bean Validation (옛 JSR-303, JSR-380)
    -> 어노테이션 기반으로 객체 검증을 할 수 있는 표준.
- Spring Boot는 기본적으로 `spring-boot-starter-validation` (Hibernate Validator) 사용.

---

## 📌 자주 쓰는 Validation 어노테이션
| 어노테이션 | 설명 | 예시 |
| ---- | ---- | ---- |
| `@NotNull` | null 불가 | Long id |
| `@NotBlank` | null / 빈문자열 / 공백 불가 | String name |
| `@NotEmpty` | null / 빈문자열 불가 (공백 허용) | List, String |
| `@Size(min, max)` | 문자열 / 컬렉션 크기 제한 | @Size(min=8, max=20) |
| `@Min`, `@Max` | 숫자 최소/최대값 | @Min(1), @Max(100) |
| `@Email` | 이메일 형식 | String email |
| `@Pattern` | 정규식 검증 | @Pattern(regexp="^\d{3}-\d{4}$") |
| `@Positive` | 양수 | int count |
| `@Future`, `@Past` | 날짜 검증 | LocalDate |

---

## 📌 @Valid vs @Validated

### `@Valid` (Jakarta 표준)
- JSR-303 표준 어노테이션
- **기본 검증만 지원**
- 그룹 지정 불가능
```java
@PostMapping("/users")
public UserRes create(@RequestBody @Valid UserReq req) { ... }
```

### `@Validated` (Spring 제공)
- Spring 전용 어노테이션
- `groups` 속성을 통해 **그룹 검증 가능**
- 메서드 파라미터 검증(@Service, @Controller)에서도 사용 가능.
```java
public interface OnCreate {}
public interface OnUpdate {}

public record UserReq(
    @NotBlank(groups = OnCreate.class) String email,
    @Size(min = 8, groups = {OnCreate.class, OnUpdate.class}) String password
) {}

@PostMapping("/users")
public UserRes create(@RequestBody @Validated(OnCreate.class) UserReq req) { ... }
```

---

## 📌 검증 실패 시 처리
- 기본적으로 `MethodArgumentNotValidException` 발생
- `@RestControllerAdvice` + `@ExceptionHandler`로 전역 처리
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        e.getBindingResult().getFieldErrors()
         .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
}
```

---

## 📌 커스텀 Validator 만들기

### 1. 어노테이션 정의
```java
@Target({ ElementType.FIELD })
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PhoneValidator.class)
public @interface Phone {
    String message() default "전화번호 형식이 올바르지 않습니다.";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
```

### 2.Validator 구현
```java
public class PhoneValidator implements ConstraintValidator<Phone, String> {
    private static final Pattern PHONE_REGEX = Pattern.compile("^010-\\d{4}-\\d{4}$");

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return PHONE_REGEX.matcher(value).matches();
    }
}
```

### 3.DTO에서 사용
```java
public record UserReq(
    @Phone String phone
) {}
```

---

## 📌 서비스/메서드 레벨 검증
`@Validated`는 클래스 레벨에도 붙일 수 있음 -> **메서드 인자 검증** 가능
```java
@Service
@Validated
public class UserService {
    public void updatePassword(@NotBlank String userId, @Size(min=8) String new Password) {
        // 파라미터 자동 검증
    }
}
```