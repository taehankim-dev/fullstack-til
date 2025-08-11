# Vue Route & Navigation Guard
> 목표 : 인증 흐름 이해
> 주제 : Vue Router 기본 구성 + 네비게이션 가드로 인증 흐름 제어

------

## 핵심 개념

### Vue Router란?
- Vue 앱의 **페이지 전환(라우팅)**을 담당하는 라이브러리
- `path`(주소)와 `component`(화면)을 매핑

### 네비게이션 가드(Navigation Guards)
- 특정 라우트로 이동하기 전/후에 실행되는 로직
- 대표적으로 인증(로그인) 체크에 활용

------

## 기본 라우터 구성

### 1. 설치
```bash
npm install vue-router
```

### 2. 라우터 설정 파일
```ts
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Dashboard from '@/views/Dashboard.vue'

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { 
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true } // 인증 필요 플래그
    },
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})
```
------

## 네비게이션 가드 구현
```ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
app.use(router)

// 전역 네비게이션 가드
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem('token') // 로그인 여부 판단

    if(to.meta.requiresAuth && !isLoggedIn) {
        next('/login') // 인증 안 돼 있으면 로그인 페이지로 이동
    } else {
        next() // 그대로 진행
    }
})

app.mount('#app')
```

---

## 간단한 로그인 예제
```vue
<template>
  <div>
    <h2>로그인 페이지</h2>
    <button @click="login">로그인</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()

function login() {
  localStorage.setItem('token', '1234')
  router.push('/dashboard')
}
</script>

```

------

## 개념 요약표
| 가드 종류 | 실행 시점 | 주 용도 |
| ---- | ---- | ---- |
| `beforeEach` | 라우트 진입 전 | 인증 체크, 권한 확인 |
| `beforeResolve` | 라우트 진입 직전 | 비동기 데이터 로딩 |
| `afterEach` | 라우트 진입 후 | 로그 기록, 페이지 타이틀 변경 |

------

## 보너스
1. 네비게이션 가드에서 `next()`를 호출하지 않으면 어떻게 될까?
- 라우팅이 멈춘다. 다음 페이지로 이동하지 않는다.

2. `to.meta.requiresAuth`의 값은 어디서 설정하는 걸까?
- 라우트 정의 시 meta 속성에서 설정.

3. 라우터 가드에서 로그인 여부를 판단하는 대표적인 3가지 방법은?
- ① `localStorage` 토큰 여부, ② Vuex/Pinia 상태, ③ 서버 세션 API 확인.
- [자세한 내용](./Vue_Router-detail.md)