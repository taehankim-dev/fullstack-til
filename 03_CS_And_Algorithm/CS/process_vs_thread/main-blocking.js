const { countPrimesBelow } = require("./heavy-task");

let tick = 0;
setInterval(() => {
  tick++;
  console.log(`[heartbeat] tick ${tick} - ${new Date().toISOString()}`);
}, 300);

setTimeout(() => {
  console.log("무거운 작업 시작 (메인 스레드에서 직접 실행)...");
  const start = Date.now();
  const result = countPrimesBelow(8_000_000);
  console.log(`무거운 작업 끝: ${result}개의 소수, ${Date.now() - start}ms 걸림`);
}, 1000);
