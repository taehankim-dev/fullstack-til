# React Hooks

## 1. Hooks의 특징
- 함수형 컴포넌트에서만 사용
- 컴포넌트 최상위에서만 호출 (조건문, 반복문 안 X)
- React 함수 안에서만 호출 (일반 JS 함수 안 X)

---

## 2. 주요 Hooks

### 상태 관리

#### `useState`
- 컴포넌트의 상태 값을 만들고 업데이트할 때 사용.
```jsx
const [count, setCount] = useState(0);
setCount(count + 1);
```

### 컴포넌트 생명주기 & 부수효과

#### `useEffect`
- 마운트/업데이트/언마운트 시 특정 작업 실행
```jsx
useEffect(() => {
    console.log('렌더링 또는 count 변경됨')
    return () => console.log("언마운트")
}, [count]) // deps 배열
```

#### `useLayoutEffect`
- `useEffect`와 비슷하지만 DOM 업데이트 직후 동기 실행
- 레이아웃 계산 / DOM 측정 시 사용

### 성능 최적화

#### `useMemo`
- 연산량이 많은 계산 결과를 메모이제이션
```jsx
const doubled = useMemo(() => count * 2, [count]);
```

#### `useCallback`
- 함수를 메모이제이션 (자식 컴포넌트에 불필요한 렌더링 방지)
```jsx
const handleClick = useCallback(() => {
    console.log(count)
}, [count])
```

### Ref & DOM 접근

#### `useRef`
- DOM 요소 접근 또는 렌더링과 무관한 값 저장
```jsx
const inputRef = useRef(null);
inputRef.current.focus();
```

### Context API와 함께

#### `useContext`
- Context 값 직접 사용 (props drilling 방지)
```jsx
const value = useContext(MyContext);
```

## 3. 잘 알려지지 않은 Hooks
- `useReducer` – 복잡한 상태 로직을 reducer 패턴으로 관리
- `useImperativeHandle` – forwardRef와 함께 커스텀 ref 제어
- `useId` – 서버사이드 렌더링 시 유니크 ID 생성
- `useTransition` – 상태 업데이트를 "덜 급한 작업"으로 표시
- `useDeferredValue` – 값 업데이트를 지연시켜 성능 향상