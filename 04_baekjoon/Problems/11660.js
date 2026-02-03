const testCase = `2 4
1 2
3 4
1 1 1 1
1 2 1 2
2 1 2 1
2 2 2 2`;

// 1. 2차원 누적합으로 푸는 방법
const inputs = testCase.split("\n");
const [N, M] = inputs[0].split(" ").map(Number);
const a = inputs.slice(1, N+1).map(line => line.split(" ").map(Number));

const psum = Array.from({length: N+1}, () => Array(N+1).fill(0))

// psum[x][y] 까지의 누적합은
// (1,1)부터 (x,y)까지의 직사각형 합
// 공식 : psum[x][y] = psum[x-1][y] + psum[x][y-1] - psum[x-1][y-1] + a[x][y]

for(let i = 1; i <= N; i++){
    for (let j = 1; j <= N; j++) {
        psum[i][j] =
            psum[i - 1][j] +
            psum[i][j - 1] -
            psum[i - 1][j - 1] +
            a[i - 1][j - 1];
    }
}

// 특정 좌표를 이용한 직사각형의 값
// sum = psum[x2][y2] - psum[x1-1][y2] - psum[x2][y1-1] + psum[x1-1][y1-1]

let out = [];
for (let k = 0; k < M; k++) {
  const [x1, y1, x2, y2] = input[N + 1 + k].split(' ').map(Number);
  const ans =
    psum[x2][y2] -
    psum[x1 - 1][y2] -
    psum[x2][y1 - 1] +
    psum[x1 - 1][y1 - 1];
  out.push(ans);
}

console.log(out.join('\n'));

// ---

// 2. 1차원 누적합으로 푸는 방법
// const inputs = testCase.split("\n");
// const [N, M] = inputs[0].split(" ").map(Number);

// const array = inputs.slice(1, N+1).map(a => a.split(" ").map(Number));
// const coordinates = inputs.slice(N+1).map(a => a.split(" ").map(Number))

// const sumArray = Array.from({length: N}, () => Array.from({length: N}, () => 0))
// for(let i = 0; i < array.length; i++){
//     sumArray[i][0] = array[i][0];
//     for(let j = 1; j < N; j++){ 
//         sumArray[i][j] = sumArray[i][j-1] + array[i][j]
//     }
// }

// const result = [];
// for(let i = 0; i < M; i++){
//     const [x1, y1, x2, y2] = coordinates[i].map(c => c - 1);

//     if( x1 === x2 && y1 === y2) {
//         result.push(array[x1][y1])
//     } else {
//         let sum = 0;
//         for(let j = x1; j <= x2; j++) {
//             sum += sumArray[j][y2]; 
//             if(y1 === 0) continue;
//             else sum -= sumArray[j][y1 - 1];
//         }
        
//         result.push(sum)
//     }
    
// }

// console.log(result.join("\n"))
