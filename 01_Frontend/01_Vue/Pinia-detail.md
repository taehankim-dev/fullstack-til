# Vue Pinia 고급 패턴
- Vue 컴포넌트에서 효율적으로 데이터 추상화하거나, 복잡한 로직을 store에 숨기고 싶을 때 유용함!

# 1. Getter 안에서 다른 Getter 참조하기.
- `getters`끼리 서로 사용 가능. `this`를 통해 접근 가능.
```ts
getters: {
    completedCount: (state) => state.todos.filter(t => t.done).length,

    completionRate(): number {
        if(this.todos.length === 0) return 0
        return Math.round((this.completedCount / this.todos.length) * 100)
    }
}
```
- `completionRate`는 `completedCount`를 내부에서 호출.
- 계산 로직이 깔끔하게 분리됨!

---

# 2. 파라미터가 필요한 Getter는 `return` 함수 형태
- Pinia `getter`는 기본적으로 파라미터를 받을 수 없지만 `getter` 내부에서 함수를 리턴하면 가능!
```ts
getters: {
    getTodoById: (state) => {
        return (id: number) => state.todos.find(t => t.id === id)
    }
}
```

```ts
const todo = todoStore.getTodoById(3)
console.log(todo)
```
- 이렇게 하면 컴포넌트에서 특정 todo를 동적으로 가져오는 게 매우 간결해짐.

---

# 3. Vue 컴포넌트에서 `computed`로 캐싱 연동하기.
```ts
import { computed } from 'vue'
import { useTodoStore } from '@/stores/todo'

const todoStore = useTodoStore()

const doneTodos = computed(() => todoStore.completedTodos)
const progressRate = computed(() => todoStore.completionRate)
```
- 이렇게 하면 자동 반응성 + 캐싱 덕분에 성능도 확보!

---

# 4. getter에서 복잡한 조건 로직 캡슐화하기
```ts
getters: {
    hasUrgentTodo: (state) => {
        return state.todos.some(t => t.text.includes('[긴급]') ** !t.done)
    }
}
```
- UI에서 `v-if="todoStore.hasUrgentTodo"`같이 로직 없이 바로 표현 가능.

---

# 5. 다른 Store의 상태나 getter 사용 (조심해서 써야 함.)
- Pinia는 싱글톤이라 가능하긴 하지만, 순환 참조 위험이 있어 의존성이 꼬이지 않게 잘 관리해야 함.
```ts
getters: {
    userTodoCount(): number {
        const userStore = useUserStore()
        return this.todos.filter(t => t.userId === userStore.currentUserId).length
    }
}
```
- 고립된 store가 아닌 연관 store 간의 상호작용이 필요한 경우 이렇게도 활용 가능.

---

# 요약
| 고급 패턴 | 설명 |
| --- | --- |
| `this`로 다른 getter 호출 | 로직 분리 |
| 함수 리턴으로 파라미터 받기 | 동적 조회 |
| `computed()`와 연결 | 반응형 UI |
| 복잡한 조건 캡슐화 | 깔끔한 UI 바인딩 |
| 다른 store 참조 | 상태 협업 |
