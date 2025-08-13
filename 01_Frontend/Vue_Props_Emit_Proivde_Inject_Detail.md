# Vue Props/Emit & Provide/Inject 고급

## 1. Props Drilling 이란?
- 상위 컴포넌트에서 하위 컴포넌트로 **props를 단계별로 계속 전달하는 패턴**
- 중간 컴포넌트가 그 데이터를 직접 쓰지 않더라도, 다음 컴포넌트에 넘기기 위해 props를 받아야 함.
- 깊은 컴포넌트 구조에서 불필요한 코드가 많아짐.

```vue
<!-- App.vue -->
<Parent :user="user" />

<!-- Parent.vue -->
<Child :user="user" /> <!-- 직접 안 쓰는데 전달만 함 -->

<!-- Child.vue -->
<p>{{ user.name }}</p>
```
- 이렇게 중간 단계에서 **데이터를 계속 '운반'** 하는 것이 `props drilling`.

----

## 2. Provide/Inject를 Props Drilling 이라고 볼 수 있을까?
- `provide/inject`는 props drilling의 대안.
- 중간 단계를 거치지 않고 조상 -> 자손 컴포넌트로 데이터 직접 전달.
- props를 단계별로 전달할 필요 없음.
- React의 Context API와 비슷한 개념
```vue
<!-- App.vue -->
<script setup>
import { provide } from 'vue'
provide('user', { name: '태한' })
</script>

<Parent />

<!-- Child.vue (App → Parent → Child 구조지만) -->
<script setup>
import { inject } from 'vue'
const user = inject('user')
</script>

<p>{{ user.name }}</p>
```
- App 에서 직접 Child로 연결되는 것처럼 동작. 중간 Parent 전혀 관여 안 함.

-----

## 3. Props Drilling과 Provide/Inject 차이 정리
| 구분    | Props Drilling    | Provide/Inject   |
| ----- | ----------------- | ---------------- |
| 전달 경로 | 단계별로 props로 전달    | 중간 단계를 건너뜀       |
| 코드 양  | 깊어질수록 많아짐         | 깊어져도 동일          |
| 목적    | 컴포넌트 간 명확한 데이터 흐름 | 전역/공용 데이터 공유     |
| 단점    | 유지보수 힘듦           | 의존성이 숨겨져서 추적 어려움 |

------

## 4. `provide/inject` 와 `store`
> 둘 다 컴포넌트 간 데이터 공유에 쓰이지만 목적과 동작 방식에서 차이가 있음.

### 주요 차이점
| 구분         | provide/inject                | store(Pinia 등)              |
| ---------- | ----------------------------- | --------------------------- |
| **데이터 범위** | 특정 조상 → 하위 자식들만               | 앱 전역(어디서든 접근 가능)            |
| **데이터 구조** | 단순 값, 객체 등 아무거나               | state, getters, actions 구조화 |
| **반응성**    | 제공 값이 `ref`나 `reactive`여야 반응형 | 기본적으로 반응형 지원                |
| **라이프사이클** | 조상 컴포넌트가 사라지면 값도 같이 소멸        | 앱이 종료될 때까지 유지               |
| **추적 가능성** | 어느 컴포넌트에서 받는지 코드만 보면 알기 힘듦    | store 이름으로 전역 추적 쉬움         |
| **의도**     | 깊은 컴포넌트 트리에서 props 전달 피하기     | 전역 상태 관리와 비즈니스 로직 캡슐화       |
| **기능 확장성** | 기본 전달만 가능                     | 상태 변경, 캐싱, 비동기 로직 등 지원      |

### 쉬운 비유로 하면
- provide/inject:
  → "이 라인(조상~자손) 안에서만 쓰는 공용 메모장"
  → 깊이 있는 구조에서 props drilling 피하려고 쓰는 편의 기능

- store(Pinia):
  → "앱 전체에서 볼 수 있는 중앙 데이터 창고"
  → 상태 관리 + 로직 + 반응성까지 한 번에 제공

### 예시 비교

#### provide/inject
```ts
// App.vue
provide('theme', ref('dark'))
// 자식 → inject('theme')
```
- App 하위에서만 유효
- 다른 트리로는 전달 안 됨.
- ref / reactive로 감싸야 반응형 유지.

#### store
```ts
// stores/theme.ts
export const useThemeStore = defineStore('theme', {
  state: () => ({ mode: 'dark' }),
})
// 어디서든 useThemeStore()로 접근
```
- 모든 컴포넌트에서 동일 상태 공유
- 반응형 기본 지원, 구조화된 관리 가능

### 결론
- `provide/inject`는 "한 컴포넌트 계보 내부"에서 가볍게 데이터 전달할 때
- `store`는 "앱 전역"에서 상태 + 로직을 구조적으로 관리할 때
- 실제 프로젝트에서는 전역 상태는 `store`, 
  특정 계층 내부 공용 데이터는 `provide/inject`로 혼합 사용