// const input = require('fs').readFileSync('/dev/stdin').toString().trim();
const input = `mobitel`;


const arr = input.split("");
const len = arr.length;

const result = [];

for(let i = 0; i < len - 2; i++){
    for(let j = i + 1; j < len -1; j++){
        const A = arr.slice(0, i + 1).reverse().join('');
        const B = arr.slice(i + 1, j + 1).reverse().join('');
        const C = arr.slice(j + 1, len).reverse().join('');
        result.push(A+B+C)
    }
}

console.log(result.sort()[0]);