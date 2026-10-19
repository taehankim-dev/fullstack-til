const path = require("path");
const { Worker } = require("worker_threads");

// TODO:
// 1. worker.js를 실행하는 Worker 인스턴스 생성
// 2. 그 Worker에게 postMessage로 숫자(예: 40_000_000)를 전송
// 3. Worker가 'message' 이벤트로 결과를 보내면 콘솔에 출력
// 4. 그 와중에도 메인 스레드가 안 멈춘다는 걸 보여주기 위해,
//    main-blocking.js처럼 setInterval로 heartbeat 로그를 계속 찍기

const worker = new Worker(path.join(__dirname, "worker.js"));

worker.on("message", (result) => {
    console.log("결과", result)

    clearInterval(heartbeat)
    worker.terminate();
})

worker.postMessage(8_000_000)

const heartbeat = setInterval(() => {
    console.log("heartbeat")
}, 1000)
