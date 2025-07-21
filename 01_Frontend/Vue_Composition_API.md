# [1주차 월요일] Vue Composition API
> `setup()`, `ref()`, `reactive()` 기본 패턴 이해

------

## 핵심 개념

### `setup()`
- Composition API의 진입점
- 컴포넌트가 마운트되기 전에 실행
- 반환한 데이터는 `<template>`에서 사용 가능
```ts
setup() {
    const message = ref("Hello")
    return { message }
}
```

------
### `ref()`
- **기본형 변수(숫자, 문자열 등)**를 반응형으로 만들 때 사용.
- `.value`로 접근해야 함(템플릿에서는 자동 언래핑됨.)
```ts
const count = ref<number>(0);
count.value++;
```

------
### `reactive()`
- **객체(Object, Array 등)** 전체를 반응형으로 만들 때 사용
- `.value` 없이 직접 속성 접근 가능.
```ts
const state = reactive({count: 0})
state.count++;
```

------
## 실습
```vue
<template>
  <div>
    <p>ref count: {{ refCount }}</p>
    <p>reactive count: {{ reactiveState.count }}</p>
    <button @click="increase">+1 증가</button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const refCount = ref(0)
const reactiveState = reactive({ count: 0 })

function increase() {
  refCount.value++
  reactiveState.count++
}
</script>
```

>📌 실습 목표:
- refCount.value vs reactiveState.count 차이 체감하기
- 버튼 클릭 시 두 방식 모두 증가하는지 확인

------
## `ref()` vs `reactive()` 차이점 요약표
| 항목 | `ref()` | `reactive()` |
| ----|----|----|
| 주 사용 용도 | 기본형 (number, string 등)  | 객체형 (object, array 등) |
| 접근 방식 | `.value` 필요 | 바로 접근 |
| 템플릿에서 | 자동 언래핑됨 | 자동 언래핑됨 |
| 얕은 복사 여부 | 얕은 복사 | 깊은 감시 |

------
## 체크리스트
- [x] `setup()` 함수에서 상태를 정의하고 반환하는 구조 이해
- [x] `ref()` 와 `reactive()`의 사용 목적과 차이점 구분
- [x] 실습 코드 작성 및 버튼 클릭으로 상태 변화 확인
- [x] 정리표로 개념 재확인 완료

------
## 보너스
1. `ref`와 `reactive` 중 템플릿에서 `.value`를 꼭 써야 하는 건 어느 쪽일까?
- 정답 : `ref()`
> `ref()` 는 `.value`를 사용해 접근하지만, 템플릿에서는 자동 언래핑되어 `refCount`처럼 바로 사용 가능.
> 반면 `reactice()`는 객체라서 속성으로 접근하고, `.value`는 쓰지 않음.

2. `reactive`안에 `ref`를 넣으면 어떻게 될까?
- 정답: ref가 자동으로 언래핑되지 않음.
```ts
const count = ref(0)
const state = reactive({
  count // 이건 ref 객체 자체가 들어감
})

console.log(state.count)         // ref 객체
console.log(state.count.value)   // 숫자 값
```
> `reactive`는 `ref`를 자동 언래핑하지 않기 때문에 내부에서 사용하려면 `state.count.value`처럼 `.value`로 접근해야 함.
> 반대로 `ref` 안에 `reactive`는 잘 작동하지 않으므로 일반적으로 **혼합 사용은 피하는 게 좋음**.