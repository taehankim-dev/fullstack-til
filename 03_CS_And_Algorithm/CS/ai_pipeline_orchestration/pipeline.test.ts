import { describe, expect, it } from "vitest";
import { Pipeline } from "./pipeline";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Pipeline", () => {
  it("등록된 스텝들을 순서대로 실행하며 ctx를 누적한다", async () => {
    const pipeline = new Pipeline();
    pipeline.addStep(async (ctx) => {
      ctx.a = 1;
    });
    pipeline.addStep(async (ctx) => {
      ctx.b = ctx.a + 1;
    });

    const result = await pipeline.run({});
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("timeoutMs를 넘기고 onError가 skip이면 그 스텝만 건너뛰고 계속한다", async () => {
    const pipeline = new Pipeline();
    pipeline.addStep(
      async (ctx) => {
        ctx.started = true;
        await sleep(50);
        ctx.neverSet = true;
      },
      { timeoutMs: 10, onError: "skip" },
    );
    pipeline.addStep(async (ctx) => {
      ctx.after = true;
    });

    const result = await pipeline.run({});
    expect(result.started).toBe(true);
    expect(result.neverSet).toBeUndefined();
    expect(result.after).toBe(true);
  });

  it("retries만큼 재시도하다 성공하면 그 결과를 반영한다", async () => {
    let attempts = 0;
    const pipeline = new Pipeline();
    pipeline.addStep(
      async (ctx) => {
        attempts++;
        if (attempts < 3) throw new Error("fail");
        ctx.succeeded = true;
      },
      { retries: 2 },
    );

    const result = await pipeline.run({});
    expect(attempts).toBe(3);
    expect(result.succeeded).toBe(true);
  });

  it("retries를 다 쓰고도 실패하면 onError 기본값(fail)으로 run() 자체가 reject된다", async () => {
    const pipeline = new Pipeline();
    pipeline.addStep(
      async () => {
        throw new Error("always fails");
      },
      { retries: 1 },
    );
    pipeline.addStep(async (ctx) => {
      ctx.shouldNotRun = true;
    });

    await expect(pipeline.run({})).rejects.toThrow();
  });

  it("onError가 skip이면 (timeout 없이도) 실패한 스텝만 건너뛰고 계속한다", async () => {
    const pipeline = new Pipeline();
    pipeline.addStep(
      async () => {
        throw new Error("oops");
      },
      { onError: "skip" },
    );
    pipeline.addStep(async (ctx) => {
      ctx.reached = true;
    });

    const result = await pipeline.run({});
    expect(result.reached).toBe(true);
  });
});
