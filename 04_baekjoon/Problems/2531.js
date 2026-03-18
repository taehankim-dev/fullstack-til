// const fs = require('fs').readFileSync(0, 'uft-8')
const fs = `8 30 4 30
7
9
7
30
2
7
9
25`

const inputs = fs.split('\n');
const [N, d, k, c] = inputs[0].split(' ').map(Number);
// N : 접시의 수, d: 초밥의 가짓수, k: 연속해서 먹는 접시의 수, c: 쿠폰 번호
const nums = inputs.splice(1).map(v => +v);

// 초밥의 빈도수를 저장할 배열 (초밥 종류가 d개 이므로 d+1)
const sushiCount = new Array(d + 1).fill(0);
let currentTypes = 0; // 현재 윈도우 안의 서로 다른 초밥 종류 수

// 처음 k 개의 초밥을 먼저 윈도우에 담기.
for(let i = 0; i < k; i++){
    if(sushiCount[nums[i]] === 0) currentTypes++;
    sushiCount[nums[i]]++;
}

let maxTypes = 0;

// 슬라이딩 윈도우 시작.
for(let i = 0; i < N; i++){
    // 쿠폰 초밥(c)을 포함한 현재 가짓수 계산
    // 쿠폰 초밥이 현재 윈도우에 없다면 종류 + 1, 있다면 그대로
    let totalWithCoupon = currentTypes;
    if(sushiCount[c] === 0) totalWithCoupon++;

    maxTypes = Math.max(maxTypes, totalWithCoupon);

    // 윈도우 이동: 왼쪽 초밥 하나 빼기
    const left = nums[i];
    sushiCount[left]--;
    if(sushiCount[left] === 0) currentTypes--;
    
    // 윈도우 이동: 오른쪽 초밥 하나 넣기
    // (i + k) % N을 통해 배열을 복사하지 않고도 회전 효과를 냄.
    const right = nums[(i + k) % N];
    if(sushiCount[right] === 0) currentTypes++;
    sushiCount[right]++;
}

console.log(maxTypes)