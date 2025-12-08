# Props/Emit, Provide/Inject
> 목표 : 컴포넌트 재사용 패턴 이해
> 주제 : 
  - 상위 -> 하위 데이터 전달(props)
  - 하위 -> 상위 이벤트 전달(emit)
  - 깊은 계층 데이터 전달(provide/inject)

------

## 핵심 개념

### 1. `props`
- 상위 -> 하위 데이터 전달
- 타입 지정 가능 (TypeScript & Vue에서 강력)
```vue
<!--Parent.vue-->
<Child :msg="parentMsg" />
<script setup lang="ts">
import Child from './Child.vue'
const parentMsg = 'Hello from parent';
</script>
```

```vue
<!-- Child.vue -->
<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<template>
  <p>{{ msg }}</p>
</template>
```

------

### 2. `emit`
- 하위 -> 상위 이벤트 전달
- `defineEmits()` 로 타입/이벤트명 정의
```vue
<!-- Child.vue -->
<script setup lang="ts">
const emit = defineEmits<{ (e: 'increment'): void }>()
function plus() {
  emit('increment')
}
</script>

<template>
  <button @click="plus">+1</button>
</template>
```
```vue
<!-- Parent.vue -->
<Child @increment="count++" />
```

------

### 3. `provide/inject`
- 깊은 계층 컴포넌트 간 데이터 전달
- 중간 컴포넌트를 거치지 않고 직접 데이터 주입
```vue
<!-- GrandParent.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'
const theme = ref('dark')
provide('theme', theme)
</script>
```

```vue
<!-- GrandChild.vue -->
<script setup lang="ts">
import { inject } from 'vue'
const theme = inject('theme', 'light') // 기본값 'light'
</script>

<template>
  <p>Theme: {{ theme }}</p>
</template>
```

------
## 실습
```vue
<template>
  <div>
    <h3>부모: {{ count }}</h3>
    <Child :start="count" @increment="count++" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Child from './Child.vue'
const count = ref(0)
</script>
```

```vue
<!-- Child.vue -->
<template>
  <p>자식: {{ start }}</p>
  <button @click="emit('increment')">+1</button>
</template>

<script setup lang="ts">
const props = defineProps<{ start: number }>()
const emit = defineEmits<{ (e: 'increment'): void }>()
</script>
```

------

## 개념 비교표
| 패턴               | 방향              | 특징           | 사용 예시          |
| ---------------- | --------------- | ------------ | -------------- |
| `props`          | 상위 → 하위         | 데이터 전달       | 목록 데이터 내려주기    |
| `emit`           | 하위 → 상위         | 이벤트 전달       | 버튼 클릭 시 부모에 알림 |
| `provide/inject` | 상위(조상) → 하위(후손) | 깊은 계층 데이터 공유 | 테마, 전역 설정      |

------

## 보너스
1. `props`와 `provide/inject`의 가장 큰 차이는?
- `props`는 직접 연결된 부모-자식 간 데이터 전달, `provide/inject`는 중간 단계 건너뛰고 조상-후손 간 데이터 전달

2. `emit`을 쓸 때 이벤트명이 문자열 오타 나면 어떻게 될까?
- TypeScript로 `defineEmits` 타입을 지정하면 컴파일 시 오류로 잡아준다. JS에서는 동작 안하거나 경고만 뜰 수 있음.

3. `provide`로 reactive 객체를 주입하면 하위 컴포넌트에서 반응형으로 동작할까?
- Yes, `ref`나 `reactive`를 주입하면 하위 컴포넌트에서 그대로 반응형으로 사용 가능.