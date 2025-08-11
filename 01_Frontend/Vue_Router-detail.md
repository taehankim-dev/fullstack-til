# 라우터 가드에서 로그인 여부 확인하는 대표적인 3가지 방법

## 1. 전역 가드(`router.beforeEach`) + 상태 관리(Pinia / Vuex)
- 설명 : 라우트가 변경될 때마다 `baforeEach` 훅에서 store의 로그인 상태를 확인
- 장점 : 한 곳에서 전체 라우팅 로직 관리 가능.
- 예시
```ts
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    if(to.meta.requiresAuth && !authStore.isLoggedIn) {
        next('/login')
    } else {
        next()
    }
})
```

---

## 2. 로컬 스토리지(LocalStorage / SessionStorage) 토큰 확인
- 설명 : 브라우저 저장소에 토큰이 있는지 바로 확인
- 장점 : 새로고침해도 상태 유지
- 단점 : 위조 가능성 있으므로 토큰 유효성은 서버에서 검증해야 함.
- 예시
```ts
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('access_token')
    if(to.meta.requiresAuth && !token) {
        next('/login')
    } else {
        next()
    }
})
```

---

## 3. 서버 세션 / 토큰 유효성 API 호출
- 설명 : 페이지 이동 시 서버에 로그인 상태를 검증 요청
- 장점 : 가장 안전, 토큰 만료/로그아웃 여부 즉시 반영
- 단점 : 페이지 이동 시 API 호출로 딜레이 발생 가능
- 예시
```ts
router.beforeEach(async (to, from, next) => {
    if(to.meta.requiresAuth) {
        const res = await fetch('/api/auth/check', { credentials: 'include'})
        if(res.ok) next()
        else next('/login')
    } else {
        next()
    }
})
```

---

## 요약
| 방법 | 장점 | 단점 | 사용 추천 상황 |
| --- | --- | --- | --- |
| Store 상태 확인 | 빠르고 간단 | 새로고침 시 초기화 | SPA 내 네비게이션 |
| 로컬 스토리지 확인 | 새로고침 유지 | 위조 가능성 | 간단한 프로젝트 |
| 서버 검증 API 확인 | 안전 | 속도 저하 가능 | 보안이 중요한 서비스 |
