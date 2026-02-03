// 투 포인터(슬라이딩 윈도우)
const test = `10 5
1 2 3 4 2 5 3 1 1 2`

const inputs = test.split("\n");

const [N, M] = inputs[0].split(" ").map(Number);
const arr = inputs[1].split(" ").map(Number);

let left = 0;
let right = 0;
let sum = 0;
let count = 0;

while(true){
    if(sum >= M){
        if(sum === M) count++;
        sum -= arr[left];
        left++;
    } else {
        if(right === N) break;
        sum += arr[right];
        right++;
    }
}

console.log(count)