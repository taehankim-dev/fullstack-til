# JPA
> JPA(Jakarta Persistence API, 과거 Java Persistence API)는 자바 객체와 관계형 데이터베이스를 연결해주는 ORM(Object-Relational Mapping) 기술이다.
> *참고: Java EE가 Eclipse Foundation으로 이관되면서 명칭이 Jakarta로 변경되었고, Spring Boot 3.0 이상부터는 패키지명도 `javax.persistence`에서 `jakarta.persistence`로 변경되었습니다.*

## 1. JPA의 특징
- 객체 지향 프로그래밍과 관계형 데이터베이스의 차이를 해결해주는 기술
- SQL을 직접 작성하지 않고 객체로 데이터베이스를 조작할 수 있음
- 영속성 컨텍스트를 통해 객체를 관리
- 트랜잭션 관리를 지원
- 다양한 데이터베이스를 지원

### 영속성 컨텍스트?
> 엔티티를 영구 저장하는 환경.

### 영속성 컨텍스트가 제공하는 주요 기능
- **1차 캐시**: 트랜잭션 범위 내에서 동일한 식별자로 조회할 때 데이터베이스가 아닌 메모리에서 데이터를 먼저 찾습니다.
- **변경 감지(Dirty Checking)**: 커밋 시점에 엔티티의 변경 사항을 체크하여 자동으로 UPDATE SQL을 생성합니다.
- **쓰기 지연(Transactional Write-behind)**: 트랜잭션을 커밋할 때까지 SQL을 모았다가 한 번에 전송하여 네트워크 비용을 줄입니다.
- **지연 로딩(Lazy Loading)**: 연관된 객체를 실제 사용하는 시점에 조회하여 초기 로딩 성능을 최적화합니다.

## 2. JPA의 장점
- 생산성 향상: SQL을 직접 작성하지 않고 객체로 데이터베이스를 조작할 수 있어 개발 속도가 빠름
- 유지보수 용이: 객체 지향적으로 코드를 작성할 수 있어 유지보수가 용이
- 이식성 향상: 다양한 데이터베이스를 지원하여 데이터베이스 변경이 용이
- 성능 향상: 영속성 컨텍스트를 통해 객체를 관리하여 성능 향상

## 3. JPA의 단점
- 학습 곡선: JPA의 개념을 이해하는 데 시간이 걸림
- 성능 저하: 복잡한 쿼리의 경우 SQL을 직접 작성하는 것이 성능에 유리할 수 있음
- 디버깅 어려움: SQL을 직접 작성하지 않아 디버깅이 어려울 수 있음

## 4. JPA의 동작 원리
1. 객체를 영속성 컨텍스트에 저장
2. 영속성 컨텍스트에서 객체를 관리
3. 트랜잭션이 커밋되면 객체를 데이터베이스에 저장
4. 트랜잭션이 롤백되면 객체를 데이터베이스에서 삭제

## 5. JPA의 주요 개념
- **영속성 컨텍스트(Persistence Context)**: 트랜잭션 동안 엔티티를 관리하는 공간
- **엔티티(Entity)**: 데이터베이스 테이블에 매핑되는 객체
- **리포지토리(Repository)**: 데이터베이스에 접근하는 객체
- **트랜잭션(Transaction)**: 데이터베이스 작업을 묶어서 처리하는 단위

## 6. JPA의 사용 예제 (Spring Boot 3.x 이상 기준)
```java
import jakarta.persistence.*; // Spring Boot 3.0 이상 (과거 javax.persistence)

// 엔티티
@Entity
@Table(name = "users") // 'user'는 DB 예약어인 경우가 많아 테이블명을 명시하는 것이 실무에서 안전합니다.
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
}

// 리포지토리
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}

// 서비스
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
```

---

## 🚀 실무 역량 강화를 위한 JPA 핵심 포인트

백엔드 개발자로서 실무에서 JPA를 사용할 때 반드시 알아야 하고 트러블슈팅에 자주 등장하는 핵심 주제들입니다.

### 1. N+1 문제와 해결 방안
- **문제 정의**: 1번의 쿼리로 N개의 결과가 나왔을 때, 연관된 데이터를 가져오기 위해 N번의 추가 쿼리가 발생하는 현상입니다. (주로 연관된 엔티티 컬렉션을 루프를 돌며 접근할 때 발생)
- **해결 방안**:
  1. **Fetch Join**: `JOIN FETCH`를 사용하여 연관된 엔티티를 한 번의 쿼리로 함께 조회합니다.
  2. **@EntityGraph**: Spring Data JPA에서 제공하는 어노테이션으로 Fetch Join을 간편하게 사용합니다.
  3. **Batch Size 조절**: `hibernate.default_batch_fetch_size` 속성을 통해 지정된 수만큼 IN 쿼리로 한 번에 조회하도록 설정합니다. (1:N 매핑 등 페이징이 필요할 때 유용)

```java
// Fetch Join 예시
@Query("SELECT u FROM User u JOIN FETCH u.orders")
List<User> findAllUsersWithOrdersFetchJoin();

// @EntityGraph 예시
@EntityGraph(attributePaths = {"orders"})
@Query("SELECT u FROM User u")
List<User> findAllUsersWithOrdersEntityGraph();
```

### 2. 즉시 로딩(EAGER)과 지연 로딩(LAZY)
- **실무 권장 사항**: **모든 연관관계는 지연 로딩(`FetchType.LAZY`)으로 설정해야 합니다.**
- 즉시 로딩을 사용하면 예상치 못한 N+1 문제나 복잡한 조인 쿼리가 발생하여 성능 저하의 주범이 됩니다.
- `@ManyToOne`, `@OneToOne`은 기본값이 즉시 로딩(EAGER)이므로 반드시 `fetch = FetchType.LAZY`로 명시해야 합니다.
- **주의점**: 지연 로딩 사용 시 트랜잭션 밖에서 프록시 객체를 초기화하려 하면 `LazyInitializationException`이 발생합니다. 트랜잭션 내에서 접근하거나 Fetch Join을 활용해야 합니다.

```java
@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne의 기본값은 EAGER이므로 반드시 LAZY로 명시
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
```

### 3. 양방향 연관관계 매핑과 주의점
- **연관관계의 주인**: 외래 키(FK)를 관리하는 쪽이 주인이 됩니다 (주로 `@ManyToOne` 측).
- **`mappedBy`**: 양방향 매핑 시, 주인이 아닌 쪽(주로 `@OneToMany` 측)에 `mappedBy`를 선언해 양방향임을 명시합니다. 주인이 아닌 쪽에서 컬렉션을 변경해도 DB에 반영되지 않습니다.
- **순환 참조 문제**: 양방향 매핑된 엔티티를 브라우저로 응답하기 위해 JSON 직렬화를 하면 양쪽에서 서로를 계속 참조하여 무한 루프(`StackOverflowError`)가 발생할 수 있습니다.
  - **해결 방안**: 엔티티를 API 응답으로 직접 반환하지 말고, 항상 **DTO(Data Transfer Object)**로 변환하여 반환하도록 설계해야 합니다.

```java
@Entity
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 주인이 아님을 명시 (Order 엔티티의 'user' 필드에 의해 매핑됨)
    // ArrayList로 초기화해두는 것이 NullPointerException 방지에 좋습니다.
    @OneToMany(mappedBy = "user")
    private List<Order> orders = new ArrayList<>();
}

// 컨트롤러 응답 시 DTO 변환 예시
public UserDtoResponse getUser(Long id) {
    User user = userRepository.findById(id).orElseThrow();
    // 엔티티를 그대로 반환하지 않고 DTO로 변환하여 반환
    return new UserDtoResponse(user.getId(), user.getName()); 
}
```

### 4. Bulk 연산 (벌크 연산) 주의점
- 대량의 데이터를 한 번에 수정/삭제할 때는 벌크 연산을 사용합니다 (`@Modifying`).
- **주의점**: 벌크 연산은 영속성 컨텍스트(1차 캐시)를 거치지 않고 직접 DB에 쿼리를 실행합니다. 이로 인해 1차 캐시와 DB의 상태가 불일치하게 됩니다.
- **해결 방안**: 벌크 연산 직후에는 반드시 영속성 컨텍스트를 초기화해야 합니다 (`em.clear()`). Spring Data JPA에서는 `@Modifying(clearAutomatically = true)` 설정으로 간단히 해결할 수 있습니다.

```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // clearAutomatically = true를 통해 벌크 연산 직후 1차 캐시 초기화
    @Modifying(clearAutomatically = true)
    @Query("UPDATE User u SET u.status = 'INACTIVE' WHERE u.lastLoginDate < :limitDate")
    int deactivateOldUsers(@Param("limitDate") LocalDateTime limitDate);
}
```

### 5. 복잡한 동적 쿼리와 Querydsl
- JPA 기본 제공 기능(`@Query` 등)만으로는 실무의 복잡한 동적 쿼리나 통계용 쿼리를 처리하기 어렵습니다.
- 실무에서는 오랫동안 **Querydsl**을 도입하여 타입 세이프(Type-Safe)하게 쿼리를 작성하는 것이 거의 표준이었습니다.
  - **최신 주의점**: Spring Boot 3.x 이상(Jakarta EE 10+)부터는 Querydsl 설정 시 반드시 `jakarta` 식별자(classifier)가 적용된 버전을 사용해야 합니다.
  - Querydsl 프로젝트의 업데이트가 다소 정체됨에 따라, 최근에는 **jOOQ**를 대안으로 도입하거나 복잡한 조회용 모델은 MyBatis / JdbcTemplate / Spring Data JDBC로 분리하는 **CQRS(Command and Query Responsibility Segregation)** 패턴도 활발히 사용되고 있습니다.

```java
// Querydsl 동적 쿼리 예시
public List<User> findUsersDynamic(String name, Integer age) {
    QUser user = QUser.user;
    BooleanBuilder builder = new BooleanBuilder();

    // 동적으로 조건이 있을 때만 WHERE 절에 추가
    if (name != null) {
        builder.and(user.name.eq(name));
    }
    if (age != null) {
        builder.and(user.age.goe(age));
    }

    return queryFactory.selectFrom(user)
                       .where(builder)
                       .fetch();
}
```

### 6. OSIV (Open Session In View)
- Spring Boot는 기본적으로 OSIV 설정값이 `true`로 되어 있어, View(컨트롤러) 영역까지 영속성 컨텍스트와 DB 커넥션을 살려둡니다.
- **실무 권장 사항**: 트래픽이 많은 실무 환경에서는 커넥션을 오래 유지하여 DB 커넥션 풀 고갈을 유발할 수 있으므로 `spring.jpa.open-in-view=false`로 끄는 것을 강력히 권장합니다. 대신 지연 로딩 등은 Service 계층(트랜잭션 범위 안)에서 모두 해결하고 DTO로 변환하여 컨트롤러로 넘기는 아키텍처를 도입해야 합니다.

### 7. Spring Boot 3.x (Hibernate 6) 주요 변경점
2026년 기준 실무에서 주로 사용하는 Spring Boot 3.x 시리즈의 기반인 Hibernate 6의 주요 특징입니다.
- **JSON 매핑 간소화**: 구버전에서는 별도의 라이브러리 추가가 필요했지만, 현재는 `@JdbcTypeCode(SqlTypes.JSON)` 어노테이션 하나로 데이터베이스의 JSON 컬럼을 자바 객체(Map, Record, DTO 등)로 손쉽게 매핑할 수 있습니다.
- **SQM (Semantic Query Model)**: 내부 구문 분석 모델이 변경되어 더 강력한 쿼리 기능과 성능 최적화가 제공됩니다.
- **자동 페치 조인 최적화 및 배열 지원**: 배열 타입 처리나 특정 상황의 페치 조인이 내부적으로 더 안전하고 편리하게 처리됩니다.

```java
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Hibernate 6 JSON 자동 매핑 (Map, List, DTO 등 모두 지원)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private Map<String, Object> attributes;
}
```