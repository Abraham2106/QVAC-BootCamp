/**
 * Example 02 — Experimento de sampling (salida JSON)
 * ==================================================
 *
 * PROPÓSITO
 *   Mismo prompt, mismo modelo, misma semilla — cambiar SOLO `temp`.
 *   Demostrar que sampling altera la selección de tokens, no el "conocimiento".
 *
 * ENTRADA ESPERADA
 *   Modelo provisionado. Dos corridas secuenciales.
 *
 * SALIDA ESPERADA
 *   JSON en stdout con configuración, salida, stopReason y stats por corrida.
 *   Redirige a archivo para el lab: npx tsx ... > sampling-results.json
 *
 * QUÉ OBSERVAR
 *   - temp 0 tiende a salidas más deterministas (con seed fija).
 *   - temp alta aumenta variabilidad; NO garantiza "más creatividad" universal.
 *   - tok/s puede ser similar; el cambio principal es el TEXTO elegido.
 *
 * CÓMO EJECUTAR
 *   npx tsx examples/02-sampling-experiment.ts
 *   npx tsx examples/02-sampling-experiment.ts > sampling-results.json
 */

import {
  close,
  completion,
  loadModel,
  QWEN3_600M_INST_Q4,
  unloadModel,
} from "@qvac/sdk";
import { writeFileSync } from "node:fs";

const PROMPT =
  "Completa esta frase de forma creativa: 'En un sistema local-first, la latencia...'";
const BASE = { seed: 42, predict: 64 } as const;

interface RunRecord {
  label: string;
  generationParams: { temp: number; seed: number; predict: number };
  output: string;
  stopReason: string | undefined;
  stats: {
    tokensPerSecond?: number;
    promptTokens?: number;
    completionTokens?: number;
  } | null;
}

async function runSampling(
  modelId: string,
  label: string,
  temp: number
): Promise<RunRecord> {
  const generationParams = { ...BASE, temp };
  const run = completion({
    modelId,
    history: [{ role: "user", content: PROMPT }],
    stream: true,
    generationParams,
  });

  let text = "";
  for await (const event of run.events) {
    if (event.type === "contentDelta") text += event.text;
  }
  const final = await run.final;

  return {
    label,
    generationParams,
    output: text.trim(),
    stopReason: final.stopReason,
    stats: final.stats
      ? {
          tokensPerSecond: final.stats.tokensPerSecond,
          promptTokens: final.stats.promptTokens,
          completionTokens: final.stats.completionTokens,
        }
      : null,
  };
}

let modelId: string | undefined;

try {
  modelId = await loadModel({
    modelSrc: QWEN3_600M_INST_Q4,
    modelConfig: { ctx_size: 2048 },
  });

  const results = {
    experiment: "sampling-comparison",
    model: "QWEN3_600M_INST_Q4",
    prompt: PROMPT,
    controlledVariable: "generationParams.temp",
    heldConstant: ["model", "prompt", "seed", "predict", "history"],
    runs: [
      await runSampling(modelId, "temp-0-deterministic", 0),
      await runSampling(modelId, "temp-1-stochastic", 1.0),
    ],
    note:
      "Valores medidos en esta máquina; no extrapolar a otros dispositivos. " +
      "Cambiar temp altera selección de tokens, no el entrenamiento del modelo.",
  };

  const json = JSON.stringify(results, null, 2);
  if (process.argv.includes("--file")) {
    writeFileSync("sampling-results.json", json);
    console.error("▸ Escrito sampling-results.json");
  }
  console.log(json);
} catch (error) {
  console.error("✖", error);
  process.exit(1);
} finally {
  if (modelId) {
    try {
      await unloadModel({ modelId, clearStorage: false });
    } catch (cleanupError) {
      console.error("✖ Fallo durante limpieza:", cleanupError);
    }
  }
  void close();
}
