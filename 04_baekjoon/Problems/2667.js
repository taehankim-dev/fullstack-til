const fs = require('fs').readFileSync(0, 'utf-8').toString().trim()
const inputs = fs.split('\n');
const N = Number(inputs.splice(0,1));

const graph = [];
for(let i = 0; i < inputs.length; i++) {
    const lines = inputs[i].split('').map(Number);
    graph.push(lines);
}

function bfs(startX, startY) {
    const queue = [];
    let cnt = 1;
    
    visited[startX][startY] = true;
    queue.push([startX, startY]);
    
    while(queue.length) {
        const [x, y] = queue.shift();
        for(let i = 0; i < 4; i++){
            const nx = x + dx[i];
            const ny = y + dy[i];
            
            if(nx >= 0 && nx < N && ny >= 0 && ny < N) {
                if(!visited[nx][ny] && graph[nx][ny] === 1) {
                    visited[nx][ny] = true;
                    cnt++;
                    queue.push([nx,ny])
                }
            }
        }
    }    
    
    return cnt;
}

const dx = [-1,1,0,0]
const dy = [0,0,1,-1]

const visited = Array.from({length : N}, () => new Array(N).fill(false))
const counts = [];
for(let i = 0; i < N; i++) {
    for(let j = 0; j < N; j++) {
        if(!visited[i][j] && graph[i][j] === 1) {
            counts.push(bfs(i,j))
        }
    }
}

console.log(counts.length);

const result = counts.sort((a,b) => a-b);
console.log(result.join('\n'))