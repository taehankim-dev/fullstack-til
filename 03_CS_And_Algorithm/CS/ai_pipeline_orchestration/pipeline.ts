export type Context = Record<string, any>;
export type Step = (ctx: Context) => Promise<void>;

export interface StepOptions {
    timeoutMs?: number;
    retries?: number;
    onError?: "fail" | "skip";
}

export class Pipeline {
    private steps: { step: Step, options: StepOptions }[] = [];

    addStep(step: Step, options: StepOptions = {}): this {
        this.steps.push({ step, options });
        return this;
    }

    async run(initialCtx: Context): Promise<Context> {
        const ctx = initialCtx;

        for (const { step, options } of this.steps) {
            const maxAttempts = 1 + (options.retries ?? 0);
            let lastError: unknown;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    await this.runWithTimeout(step, ctx, options.timeoutMs);
                    lastError = undefined;
                    break; // 성공했으니 재시도 루프 탈출
                } catch (err) {
                    lastError = err; // 실패하면 다음 attempt로 넘어감.
                }
            }

            if (lastError) {
                if (options.onError === "skip") continue;
                else throw lastError;
            }
        }

        return ctx;
    }

    private async runWithTimeout(step: Step, ctx: Context, timeoutMs?: number): Promise<void> {
        if (timeoutMs) {
            let timeout!: NodeJS.Timeout;
            // 타임아웃이 있으면 Promise.race로 제한시간 설정.
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeout = setTimeout(() => {
                    reject(new Error(`Step timed out after ${timeoutMs}ms`));
                }, timeoutMs)
            });

            // 실제 스텝과 타임아웃을 race.
            try {
                return await Promise.race([step(ctx), timeoutPromise]);
            } finally {
                clearTimeout(timeout);
            }

        } else {
            return step(ctx);
        }
    }

}
