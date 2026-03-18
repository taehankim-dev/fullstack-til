const fs = `4 3
4 7
10 15
2 2
5 1`

const inputs = fs.split('\n')
const [N , K] = inputs[0].split(' ').map(Number);

const MAX_COORD = 1000000;
const arr = new Array(MAX_COORD + 1).fill(0);

let lastCoord = 0;
for(let i = 1; i <= N; i++){
    const [g, x] = inputs[i].split(' ').map(Number);
    arr[x] = g;
    if(x > lastCoord) lastCoord = x;
}

const windowSize = 2 * K + 1;
let currentSum = 0;
let maxSum = 0;

for(let i = 0; i < windowSize && i <= MAX_COORD; i++) {
    currentSum += arr[i];
}

maxSum = currentSum

for(let i = windowSize; i <= MAX_COORD; i++) {
    currentSum += arr[i];
    currentSum -= arr[i - windowSize];

    if(currentSum > maxSum) {
        maxSum = currentSum
    }
}

console.log(maxSum)

/**풀이 방법
 * 1. 얼음통 배열을 만들어 준다.
 * 2. 슬라이딩 윈도우를 사용하기 위해 윈도우 사이즈를 정의한다.
 * - 백곰이 좌우로 K만큼 닿는다고 했으니까 2 * K + 1
 * 3. 처음 얼음의 개수를 먼저 계산해준다.
 * 4. 이제 윈도우 위치를 하나씩 옮기면서 왼쪽은 빼주고, 오른쪽은 더해준다.
 * 5. 얼음의 합산과 최대값을 비교하며 최대값을 찾는다.
 */