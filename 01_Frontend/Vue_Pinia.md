# Vue Pinia
> Pinia를 사용한 상태 관리 & CRUD 기본 패턴

------

## 핵심 개념

### Pinia란?
- Vue 공식 상태 관리 라이브러리 (`Vuex` 후속)
- Composition API와 찰떡궁합
- `store`라는 전역 객체로 상태를 관리함

### 기본 흐름
1. store 생성
2. 컴포넌트에서 store 가져와 사용
3. state, actions, getters 정의

---

## 실습 예제

### 시나리오 : 간단한 Todo 관리
1. Pinia 설정
```bash
npm install pinia
```

```ts
// main.ts
import { createPinia } from 'pinia'
app.use(createPinia())
```
---
2. Store 정의
```ts
// stores/todo.ts
import { defineStore } from 'pinia'

export const useTodoStore = defineStore('todo', {
    state: () => ({
        todos: [] as {id: number; text: string; done: boolean}[],
        nextId: 1
    }),
     // ✅ 계산된 값
    getters: {
        // 완료된 항목만 반환
        completedTodos: (state) => state.todos.filter(t => t.done),

        // 미완료 항목만 반환
        pendingTodos: (state) => state.todos.filter(t => !t.done),

        // 전체 개수
        totalCount: (state) => state.todos.length,

        // 완료된 개수
        completedCount: (state) => state.todos.filter(t => t.done).length,

        // 완료율 (%)
        completionRate: (state) => {
        if (state.todos.length === 0) return 0
            return Math.round(
                (state.todos.filter(t => t.done).length / state.todos.length) * 100
            )
        }
    },
    // 상태 변경 메서드
    actions: {
        addTodo(text: string) {
            this.todos.push({id: this.nextId++, text, done: false})
        },
        toggleTodo(id: number) {
            const todo = this.todos.find(t => t.id === id)
            if(todo) todo.done = !todo.done
        },
        removeTodo(id: number){
            this.todos = this.todos.filter(t => t.id !== id)
        }
    }
})
```
----
3. 컴포넌트에서 사용
```vue
<template>
  <div>
    <input v-model="newTodo" @keyup.enter="add" placeholder="할 일 입력" />
    <ul>
      <li
        v-for="todo in store.todos"
        :key="todo.id"
        @click="store.toggleTodo(todo.id)"
        :style="{ textDecoration: todo.done ? 'line-through' : 'none' }"
      >
        {{ todo.text }}
        <button @click.stop="store.removeTodo(todo.id)">삭제</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '@/stores/todo'

const store = useTodoStore()
const newTodo = ref('')

function add() {
  if (newTodo.value.trim()) {
    store.addTodo(newTodo.value)
    newTodo.value = ''
  }
}
</script>
```

---
## 개념 복습 요약표
| 항목 | 설명 |
|---|---|
| `defineStore` | Pinia에서 store 정의 함수 |
| `state` | 전역 상태 정의 (반응형 객체) |
| `actions` | 함수 정의 공간 (CRUD 등) |
| `getters` | computed처럼 파생 상태 생성 |
| `useTodoStore()` | 해당 store를 컴포넌트에서 사용 |

---
## 체크리스트
- [x] Pinia 설치 및 기본 설정 이해
- [x] Store 생성 및 `state`, `actions` 구조 학습
- [x] 컴포넌트에서 store 사용 및 CRUD 연결
- [x] `v-model`, `v-for`, `@click` 등과 조합 사용
---

## 보너스
1. `defineStore()`로 만든 store는 어디서든 import해서 여러 번 쓸 수 있을까?
- Yes. 단, 내부적으로 Pinia가 싱글톤으로 관리함.
> Pinia 가 싱글톤(Singleton)으로 관리된다의 의미
> - **Pinia의 store는 앱 전체에서 단 하나의 인스턴스로 공유된다는 뜻**
> - 즉, store를 여러 컴포넌트에서 불러와도 같은 데이터(상태) 를 바라본다.
> - 마치 전역 변수처럼 앱 전체에서 하나의 store 인스턴스를 공유.

2. Pinia `actions` 안에서 `this`는 뭘 가리킬까?
- 해당 store 인스턴스를 가리킴. 그래서 `this.todos`나 `this.nextId` 사용 가능.

3. `getters`와 `computed()` 는 어떤 관계가 있을까?
- `getters`는 내부적으로 `computed()`로 동작해서 반응형이다. 파생 데이터 만들 때 유용.

- [Pinia 고급 패턴](./Vue_Pinia-detail.md)