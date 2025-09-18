# Spring Batch vs @Scheduled

## 1. `@Scheduled`
- "간단한 반복 작업용"
- 특징
    - 스프링 자체 스케줄링 기능
    - `@EnableScheduling` + `@Scheduled` 만 있으면 사용 가능.
    - fixedRate, fixedDelay, cron 표현식 지원
    - **상태 관리 X** (실패 / 재시작 / 이력 관리 없음)
    - 단순한 주기성 작업에 적합
- 예시
    - 5분마다 캐시 초기화
    - 매일 자정 로그 파일 정리
    - API 호출해서 데이터 싱크

```java
@EnableScheduling
@SpringBootApplication
public class Application { }

@Component
public class SimpleJob {

    @Scheduled(cron = "0 0 * * * *") // 매시간 정각
    public void clearCache() {
        System.out.println("캐시 초기화 실행!");
    }
}
```

---

## 2. Spring Batch
- "대규모 배치 처리용"
- 특징
    - 별도의 프레임워크(Spring Batch 라이브러리 필요)
    - **대용량 데이터 처리**에 특화 (DB, 파일, 큐 등)
    - **Step / Job** 구조: 작업을 잘게 나눠 단계별로 처리
    - 실패/재시작/로그 추적/트랜잭션 관리 지원
    - JobLauncher, JobRepository, JobExplorer 같은 관리 기능 제공
- 사용 예시
    - 1억 건 DB 데이터 마이그레이션
    - CSV -> DB 저장, DB -> Excel 파일 추출
    - 결제/주문 데이터 집계, 월별 리포트 생성.

```java
@Configuration
@EnableBatchProcessing
public class BatchConfig {

    @Bean
    public Job sampleJob(JobBuilderFactory jobBuilders, Step step1) {
        return jobBuilders.get("sampleJob")
                          .start(step1)
                          .build();
    }

    @Bean
    public Step step1(StepBuilderFactory stepBuilders) {
        return stepBuilders.get("step1")
                           .<String, String>chunk(10)
                           .reader(() -> null) // ItemReader
                           .processor(item -> item) // ItemProcessor
                           .writer(items -> System.out.println(items)) // ItemWriter
                           .build();
    }
}
```