import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 기본 'threads' 풀이 샌드박스/제한된 환경에서 워커 스레드를 못 띄워 깨지는 경우가 있어서,
    // 같은 프로세스 안의 VM 컨텍스트에서 테스트를 실행하는 vmThreads로 고정함.
    pool: "vmThreads",
  },
});
