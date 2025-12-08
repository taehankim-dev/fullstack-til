// const fs = require('fs');
// const N = Number(fs.readFileSync(0, 'utf8').toString().trim())

const N = 14;

let line = 0; // 몇번째 줄인가
let sum = 0; // 누적합

// N이 몇번째 줄에 속하는지 찾기.
while(sum < N) {
    line++;
    sum += line;
}

// N이 속한 줄의 시작 인덱스와 위치 인덱스 찾기.
let startIndex = sum - line + 1; // 해당 줄의 시작 인덱스
let positionIndex = N - startIndex + 1; // 해당 줄에서의 위치 인덱스

// 분자 분모 변수
let numerator, denominator;

if(line % 2 === 1) {
    // 홀수줄: 위에서 아래로 내려감
    // 분자 감소, 분모 증가
    numerator = line - positionIndex + 1;
    denominator = positionIndex;
} else {
    // 짝수줄: 아래에서 위로 올라감
    // 분자 증가, 분모 감소
    numerator = positionIndex;
    denominator = line - positionIndex + 1;
}

console.log(`${numerator}/${denominator}`);
