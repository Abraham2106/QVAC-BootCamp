/**
 * Example 02 — Comparar dos modelos con el mismo prompt determinista
 * ==================================================================
 *
 * PROPÓSITO
 *   La comparación honesta: dos modelos de catálogo, MISMO prompt,
 *   temperatura 0 y semilla fija → medir carga, TTFT y tok/s de cada uno.
 *
 * ENTRADA ESPERADA
 *   Ambos assets ya provisionados (corre examples/01 de la Clase 1 o
 *   downloadAsset para cada constante). Red opcional si está cacheado.
 *
 * SALIDA ESPERADA
 *   Tabla comparativa final: loadMs · TTFT · tok/s · primeros caracteres.
 *
 * QUÉ OBSERVAR
 *   - El 600M debería cargar más rápido y generar con más tok/s (menos pesos).
 *   - Con temp:0 y seed fija, la salida de CADA modelo es reproducible
 *     entre corridas — pero son modelos distintos: textos distintos.
 *   - unloadModel ENTRE modelos: nunca dos residentes si no hacen falta.
 *
 * CÓMO EJECUTAR
 *   npx tsx examples/02-compare-models.ts
 *
 * LIMPIEZA
 *   unloadModel después de CADA modelo + close() al final.
 *
 * MODIFICACIÓN DEL ESTUDIANTE
 *   Sustituye QWEN3_600M_INST_Q4 por QWEN3_1_7B_INST_Q4 (si tu RAM lo
 *   permite) y observa cómo cambian las tres métricas.
 */

import {
  close,
  completion,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  QWEN3_600M_INST_Q4,
  unloadModel,
} from "@qvac/sdk";

const PROMPT = "Enumera tres ventajas de la inferencia local en una frase por punto.";
// Determinismo: temperatura 0 + semilla fija + límite de tokens nuevos.
const GEN = { temp: 0, seed: 42, predict: 128 };

interface Row {
  modelo: string;
  loadMs: number;
  ttftMs: number;
  tokPerSec: string;
  muestra: string;
}

const rows: Row[] = [];

async function probe(name: string, modelSrc: object): Promise<void> {
  let modelId: string | undefined;
  try {
    const t0 = performance.now();
    modelId = await loadModel({ modelSrc: modelSrc as never, modelConfig: { ctx_size: 2048 } });
    const loadMs = performance.now() - t0;

    const sentAt = performance.now();
    let ttftMs: number | null = null;
    let text = "";

    const run = completion({
      modelId,
      history: [{ role: "user", content: PROMPT }],
      stream: true,
      generationParams: GEN,
    });
    for await (const ev of run.events) {
      if (ev.type === "contentDelta") {
        if (ttftMs === null) ttftMs = performance.now() - sentAt;
        text += ev.text;
      }
    }
    const final = await run.final;
    rows.push({
      modelo: name,
      loadMs: Math.round(loadMs),
      ttftMs: Math.round(ttftMs ?? NaN),
      tokPerSec: final.stats?.tokensPerSecond ? final.stats.tokensPerSecond.toFixed(1) : "n/a",
      muestra: text.replace(/\s+/g, " ").slice(0, 60) + "…",
    });
  } finally {
    if (modelId) await unloadModel({ modelId, clearStorage: false });
  }
}

try {
  await probe("QWEN3_600M_INST_Q4", QWEN3_600M_INST_Q4);
  await probe("LLAMA_3_2_1B_INST_Q4_0", LLAMA_3_2_1B_INST_Q4_0);

  console.log("\n▸ Comparación (misma máquina, mismo prompt, temp 0 · seed 42):");
  console.table(rows);
  console.log("▸ La calidad se evalúa leyendo las muestras — los números solos no eligen.");
} catch (error) {
  console.error("✖", error);
  process.exit(1);
} finally {
  void close();
}
