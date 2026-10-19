const { parentPort } = require("worker_threads");
const { countPrimesBelow } = require("./heavy-task");

// TODO: parentPort로 메시지(숫자 n)가 오면,
// countPrimesBelow(n)을 계산해서 그 결과를 parentPort.postMessage로 다시 보내기

parentPort?.on("message", (n) => {
    const result = countPrimesBelow(n);
    parentPort?.postMessage(result);
})