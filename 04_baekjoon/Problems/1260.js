// const fs = require("fs").readFileSync(0, 'utf-8').trim();

const fs = `4 5 1
1 2
1 3
1 4
2 4
3 4`


const inputs = fs.split("\n");
const [N, M, V] = inputs[0].split(" ").map(Number);

const graph = Array.from({length: N + 1}, () => [])

// 그래프 만들기
for(let i = 1; i <= M; i++) {
    const [a,b] = inputs[i].split(' ').map(Number);
    graph[a].push(b);
    graph[b].push(a)
}

// 그래프 정렬하기
for(let i = 1; i <= N; i++) {
    graph[i].sort((a,b) => a-b)
}

// DFS
const DFSVisited = new Array(N + 1).fill(false);
const DFSAnswer = [];
const dfs = (value) => {
    DFSVisited[value] = true;
    DFSAnswer.push(value);

    for(let node of graph[value]) {
        if(!DFSVisited[node]) dfs(node);
    }
}

// BFS
const BFSVisited = new Array(N + 1).fill(false);
const BFSAnswer = [];
const bfs = (start) => {
    const queue = [start];
    BFSVisited[start] = true;
    
    let head = 0;
    while(head < queue.length) {
        const v = queue[head++];
        BFSAnswer.push(v);

        for(const next of graph[v]) {
            if(!BFSVisited[next]) {
                BFSVisited[next] = true
                queue.push(next)
            }
        }
    }
}

dfs(V);
bfs(V)

console.log(DFSAnswer.join(" "))
console.log(BFSAnswer.join(' '))