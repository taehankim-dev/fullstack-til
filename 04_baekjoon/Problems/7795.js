const fs = require('fs').readFileSync(0, 'utf-8').toString().trim();
const inputs = fs.split('\n');
const T = Number(inputs.splice(0,1));

let i = 0, idx = 0;
const result = [];
while(i < T) {
    const [N, M] = inputs[idx++].split(' ').map(Number);
    const NArr = inputs[idx++].split(' ').map(Number).sort((a, b) => a - b);
    const MArr = inputs[idx++].split(' ').map(Number).sort((a,b) => a - b);

    let a = 0, b = 0, cnt = 0;
    while(a < N){
        if(NArr[a] > MArr[b]) {
            cnt++;
            b++;

            if(b === M) {
                a++;
                b = 0;
            }
        } else {
            a++;
            b = 0;
        }
    }

    result.push(cnt)
    i++
}
console.log(result.join('\n'))