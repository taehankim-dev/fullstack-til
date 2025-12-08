# Next.js App Router 기본 구조 

## Next.js 설치 & 기본 폴더 구조 보기

### 프로젝트 생성
```bash
npx create-next-app@latest my-app
```

### 생성된 폴더 구조
```lua
my-app/
  app/
    layout.tsx
    page.tsx
    globals.css
  public/
  next.config.ts
  package.json
```

---

## App Router 구조 이해

### 특징
- 모든 라우팅은 `app/` 폴더 기준
- 폴더 이름 = URL 경로
- `page.tsx` = 해당 경로의 화면
- `layout.tsx` = 공통 레이아웃

---

## 페이지 라우팅 개념
예시
```lua
app/
  page.tsx
  about/
    page.tsx
  products/
    page.tsx
  products/[id]/
    page.tsx
```

URL은 자동으로 이렇게 됨:
- `/` -> app/page.tsx
- `/about` -> app/about/page.tsx
- `/products` -> app/products/page.tsx
- `/products/123` -> app/products/[id]/page.tsx

---

## layout.tsx가 뭔지만 이해하기
`layout.tsx`는 페이지의 "틀"을 담당함.

예:
```tsx
export default function RootLayout({ children }) {
    return (
        <html lang="ko">
            <body>
                <nav>메뉴</nav>
                <main>{children}</main>
            </body>
        </html>
    )
}
```

여기서 `children`은 각 page.tsx가 자리 잡는 위치.

특징:
- 모든 페이지에서 공통으로 적용됨
- 중첩 레이아웃도 가능 (폴더 내부에 layout.tsx 추가)