export interface TurnMetrics {
  ttftMs: number | null;
  totalMs: number;
  tokensPerSecond: number | null;
  stopReason: string | null;
}

/** TODO: record TTFT on first contentDelta, finalize from run.final stats */
export function createTurnMetrics(): {
  markFirstToken(): void;
  finalize(final: { stats?: { tokensPerSecond?: number }; stopReason?: string }): TurnMetrics;
} {
  const t0 = performance.now();
  let ttft: number | null = null;
  return {
    markFirstToken() {
      if (ttft === null) ttft = performance.now() - t0;
    },
    finalize(final) {
      return {
        ttftMs: ttft,
        totalMs: performance.now() - t0,
        tokensPerSecond: final.stats?.tokensPerSecond ?? null,
        stopReason: final.stopReason ?? null,
      };
    },
  };
}

export function formatMetrics(m: TurnMetrics): string {
  return [
    `TTFT: ${m.ttftMs?.toFixed(0) ?? "—"} ms`,
    `Total: ${m.totalMs.toFixed(0)} ms`,
    `tok/s: ${m.tokensPerSecond?.toFixed(1) ?? "—"}`,
    `stopReason: ${m.stopReason ?? "—"}`,
  ].join(" · ");
}
