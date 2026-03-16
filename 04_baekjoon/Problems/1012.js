const fs = `2
10 8 17
0 0
1 0
1 1
4 2
4 3
4 5
2 4
3 4
7 4
8 4
9 4
7 5
8 5
9 5
7 6
8 6
9 6
10 10 1
5 5`

const inputs = fs.split('\n');
const T = Number(inputs.splice(0, 1));

let i = 0, j = 0;

while(i < T){
    const [N, M, K] = inputs[j++].split(" ").map(Number);

    const graph = Array.from({length: M}, () => Array(N).fill(0));
    const visited = Array.from({length: M}, () => Array(N).fill(false));
    for(let k = 0; k < K; k++) {
        const [x, y] = inputs[j++].split(' ').map(Number);
        graph[y][x] = 1;
    }

    let worms = 0;

    for(let a = 0; a < M; a++) {
        for(let b = 0; b < N; b++){
            if(!visited[a][b] && graph[a][b] === 1) {
                worms++;

                const queue = [];
                queue.push([a,b]);
                visited[a][b] = true;

                const dx = [0,0,-1,1];
                const dy = [-1,1,0,0];

                for(let c = 0; c < 4; c++){
                    const [currA, currB] = queue.shift();
                    const nx = currA + dx[c];
                    const ny = currB + dy[c];

                    if(nx >= 0 && nx < M && ny >= 0 && ny < N) {
                        if(!visited[nx][ny] && graph[nx][ny] === 1) {
                            visited[nx][ny] = true;
                            queue.push([nx,ny])
                        }
                    }
                }
            }
        }
    }

    console.log(worms)
    i++;
}