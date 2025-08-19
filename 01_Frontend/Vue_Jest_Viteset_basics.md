# Vue Jest/Vitest
> 🎯 목표: 테스트 흐름 익히기
> 📘 주제: Jest & Vitest 기본 패턴

---

## 핵심 개념

### 1. 테스트의 필요성
- **테스트 코드**는 기능이 의도대로 동작하는지 검증하는 자동화된 코드
- 장점:
    - 버그를 미리 발견 가능
    - 리팩토링 시 안정성 확보
    - 협업 시 코드 신뢰도 증가

---

### 2. 설치 및 기본 실행

Vitest 설치
```bash
npm install -D vitest @vitest/ui
```

`package.json`에 스크립트 추가
```json
{
    "scripts": {
        "test": "vitest"
    }
}
```

---

### 3. 간단한 테스트 작성

1. 함수 작성
```ts
// utils/math.ts
export function add(a: number, b: number) {
    return a + b;
}
```

2. 테스트 작성
```ts
// utils/math.test.ts
import { describe, it, expect } from 'vitest'
import { add } from './math'

describe('math utils', () => {
    it('두 수를 더한다.', () => {
        expect(add(2,3)).toBe(5)
    })

    it('음수도 더할 수 있다.', () => {
        export(add(-1,-2)).toBe(-3)
    })
})
```

---

### 4. Vue 컴포넌트 테스트
```vue
<!-- Counter.vue -->
<template>
    <button @click="count++">Clicked: {{ count }}</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>
```

```ts
// Counter.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect }  from 'vitest'
import Counter from './Counter.vue'

describe('Counter.vue', () => {
    it('버튼 클릭 시 count 증가', async() => {
        const wrapper = mount(Counter)
        expect(wrapper.text()).toContain('Clicked: 0')

        await wrapper.find('button').trigger('click')
        expect(wrapper.text()).toContain('Clicked: 1')
    })
})
```

---

### 5. 개념 요약표
| 키워드        | 설명                 |
| ---------- | ------------------ |
| `describe` | 테스트 그룹 묶기          |
| `it`       | 개별 테스트 케이스         |
| `expect`   | 결과 검증 (matcher 사용) |
| `toBe`     | 원시값 비교             |
| `toEqual`  | 객체/배열 구조 비교        |
| `toContain` | 배열/문자열 안에 특정 값이 포함되어 있는지 확인. |

---

## 보너스
1. `toBe`와 `toEqual`의 차이는?
- `toBe`는 엄격한 일치(===), `toEqual`은 객체/배열 같은 구조 비교에 사용.

2. `mount`와 `shallowMount`의 차이는?
- `mount`는 자식 컴포넌트까지 렌더링, `shallowMount`는 자식은 스텁 처리.

3. 테스트를 실행할 때, `await wrapper.find('button').trigger('click')`처럼 await를 쓰는 이유는?
- Vue의 DOM 업데이트는 비동기라서, 클릭 후 반영된 결과를 기다리기 위해 `await` 필요.