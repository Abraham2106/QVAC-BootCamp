/**
 * Inference Benchmark Lab — STARTER
 * =================================
 *
 * Completa los 6 TODO apoyándote en ../examples/. Auto-verificación al final.
 *
 * Uso:
 *   npx tsx inference-lab-starter.ts
 *   npx tsx inference-lab-starter.ts --json
 *
 * Modelo por defecto: QWEN3_600M_INST_Q4 (ligero). Cambia a LLAMA_3_2_1B_INST_Q4_0 si prefieres.
 */

import {
  close,
  completion,
  loadModel,
  QWEN3_600M_INST_Q4,
  unloadModel,
} from "@qvac/sdk";

const AS_JSON = process.argv.includes("--json");
const MODEL_LABEL = "QWEN3_600M_INST_Q4";

interface LabReport {
  model: string;
  baselineTtftMs: number;
  baselineTps: string;
  samplingDifferent: boolean;
  contextLongerTtftMs: number;
  contextShortTtftMs: number;
  kvCachedTtftMs: number;
  kvUncachedTtftMs: number;
  breakItStopReason: string;
}

const report: Partial<LabReport> = { model: MODEL_LABEL };

async function measureRun(
  modelId: string,
  history: { role: string; content: string }[],
  generationParams: { temp: number; seed: number; predict: number },
  kvCache?: boolean | string
) {
  const sentAt = performance.now();
  let ttftMs: number | null = null;
  let text = "";

  const run = completion({
    modelId,
    history,
    stream: true,
    generationParams,
    ...(kvCache !== undefined ? { kvCache } : {}),
  });

  for await (const event of run.events) {
    if (event.type === "contentDelta") {
      if (ttftMs === null) ttftMs = performance.now() - sentAt;
      text += event.text;
    }
  }

  const final = await run.final;
  return {
    ttftMs: ttftMs ?? NaN,
    totalMs: performance.now() - sentAt,
    text: text.trim(),
    stopReason: final.stopReason ?? "n/a",
    tps: final.stats?.tokensPerSecond?.toFixed(1) ?? "n/a",
    assistantForCache: final.cacheableAssistantContent ?? final.contentText,
  };
}

let modelId: string | undefined;

try {
  // ------------------------------------------------------------------
  // TODO 0 — Carga medida: loadModel({ modelSrc, modelConfig:{ctx_size:2048} })
  // Guarda modelId. Mide loadMs si quieres (opcional para el reporte).
  // ------------------------------------------------------------------
  modelId = undefined; // reemplázame

  if (!modelId) throw new Error("TODO 0: carga el modelo");

  // ------------------------------------------------------------------
  // TODO 1 — Baseline streaming: completion con events; registra TTFT
  // (primer contentDelta) y tok/s en report.baselineTtftMs / baselineTps.
  // ------------------------------------------------------------------
  report.baselineTtftMs = NaN; // reemplázame
  report.baselineTps = "n/a"; // reemplázame

  // ------------------------------------------------------------------
  // TODO 2 — Sampling: mismo prompt, seed 42, temp 0 vs temp 1.0.
  // report.samplingDifferent = (textos distintos).
  // ------------------------------------------------------------------
  report.samplingDifferent = false; // reemplázame

  // ------------------------------------------------------------------
  // TODO 3 — Contexto: history corta vs larga, misma pregunta final.
  // Guarda TTFT de cada caso en report.contextShortTtftMs / contextLongerTtftMs.
  // ------------------------------------------------------------------
  report.contextShortTtftMs = NaN; // reemplázame
  report.contextLongerTtftMs = NaN; // reemplázame

  // ------------------------------------------------------------------
  // TODO 4 — KV cache: turno 1 + follow-up cached vs uncached (kvCache string).
  // report.kvCachedTtftMs / kvUncachedTtftMs.
  // ------------------------------------------------------------------
  report.kvCachedTtftMs = NaN; // reemplázame
  report.kvUncachedTtftMs = NaN; // reemplázame

  // ------------------------------------------------------------------
  // TODO 5 — Break It: predict: 8, prompt largo; captura stopReason en
  // report.breakItStopReason (esperado: "length" si el runtime lo reporta así).
  // ------------------------------------------------------------------
  report.breakItStopReason = "n/a"; // reemplázame

  // ------------------------------------------------------------------
  // Auto-verificación
  // ------------------------------------------------------------------
  const checks: [string, boolean][] = [
    ["modelo cargado", Boolean(modelId)],
    ["baseline TTFT medido", Number.isFinite(report.baselineTtftMs)],
    ["baseline tok/s", report.baselineTps !== "n/a"],
    ["sampling comparado", typeof report.samplingDifferent === "boolean"],
    ["contexto corto/largo", Number.isFinite(report.contextShortTtftMs) && Number.isFinite(report.contextLongerTtftMs)],
    ["KV cache comparado", Number.isFinite(report.kvCachedTtftMs) && Number.isFinite(report.kvUncachedTtftMs)],
    ["Break It stopReason", report.breakItStopReason !== "n/a"],
  ];

  for (const [name, ok] of checks) console.log(`${ok ? "✔" : "✖"} ${name}`);
  if (!checks.every(([, ok]) => ok)) process.exit(1);

  if (AS_JSON) console.log("\n" + JSON.stringify(report, null, 2));
  else console.log("\n▸ Reporte:", report);

  console.log("\n✔ INFERENCE LAB OK");
} catch (error) {
  console.error("✖ Fallo:", error);
  process.exit(1);
} finally {
  // TODO 5 (continuación) — Limpieza global: unloadModel + void close()
  if (modelId) {
    try {
      await unloadModel({ modelId, clearStorage: false });
    } catch (cleanupError) {
      console.error("✖ Fallo durante limpieza:", cleanupError);
    }
  }
  void close();
}
