/**
 * Example 04 — KV cache: follow-up con y sin reutilización
 * ========================================================
 *
 * PROPÓSITO
 *   Demostrar el contrato `kvCache` de QVAC:
 *   - Turno 1 con cache habilitado (construye estado reutilizable)
 *   - Turno 2 follow-up CON la misma clave de sesión
 *   - Turno 3 misma history SIN cache (reprocesa todo)
 *
 *   Pregunta del experimento: "¿El cache reuse cambia ESTE workload en ESTA máquina?"
 *   NO prometer speedup universal.
 *
 * KV CACHE ≠ memoria semántica de largo plazo. Reutiliza attention state compatible.
 *
 * CÓMO EJECUTAR
 *   npx tsx examples/04-kv-cache.ts
 */

import {
  close,
  completion,
  deleteCache,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
} from "@qvac/sdk";

const SESSION_KEY = "class-03-kv-demo";
const GEN = { temp: 0, seed: 42, predict: 48 } as const;

interface TimingRow {
  phase: string;
  ttftMs: number | null;
  totalMs: number;
  stopReason: string | undefined;
  tokensPerSecond: string;
}

async function timedCompletion(
  modelId: string,
  history: { role: string; content: string }[],
  kvCache: boolean | string | undefined,
  phase: string
): Promise<{ row: TimingRow; assistantContent: string }> {
  const sentAt = performance.now();
  let ttftMs: number | null = null;
  let text = "";

  const run = completion({
    modelId,
    history,
    stream: true,
    generationParams: GEN,
    ...(kvCache !== undefined ? { kvCache } : {}),
  });

  for await (const event of run.events) {
    if (event.type === "contentDelta") {
      if (ttftMs === null) ttftMs = performance.now() - sentAt;
      text += event.text;
    }
  }

  const totalMs = performance.now() - sentAt;
  const final = await run.final;

  return {
    row: {
      phase,
      ttftMs: ttftMs === null ? null : Math.round(ttftMs),
      totalMs: Math.round(totalMs),
      stopReason: final.stopReason,
      tokensPerSecond: final.stats?.tokensPerSecond?.toFixed(1) ?? "n/a",
    },
    assistantContent: final.cacheableAssistantContent ?? final.contentText,
  };
}

let modelId: string | undefined;

try {
  console.log("▸ Cargando modelo...");
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 4096 },
  });

  const rows: TimingRow[] = [];

  // Turno 1 — construye cache bajo clave caller-managed
  console.log("\n▸ Turno 1 (construyendo cache)...");
  const turn1 = await timedCompletion(
    modelId,
    [{ role: "user", content: "¿Cuál es la capital de Francia?" }],
    SESSION_KEY,
    "turn-1-build-cache"
  );
  rows.push(turn1.row);
  console.log(`   respuesta: ${turn1.assistantContent.slice(0, 80)}…`);

  const history2 = [
    { role: "user", content: "¿Cuál es la capital de Francia?" },
    { role: "assistant", content: turn1.assistantContent },
    { role: "user", content: "¿Y la de Alemania?" },
  ];

  // Turno 2 — follow-up CON cache (misma clave de sesión)
  console.log("\n▸ Turno 2 follow-up CON kvCache (misma clave)...");
  const turn2 = await timedCompletion(modelId, history2, SESSION_KEY, "turn-2-cached-followup");
  rows.push(turn2.row);

  // Turno 3 — misma history SIN cache
  console.log("\n▸ Turno 3 misma history SIN kvCache...");
  const turn3 = await timedCompletion(modelId, history2, false, "turn-3-uncached-same-history");
  rows.push(turn3.row);

  console.log("\n▸ Comparación (esta máquina, este workload):");
  console.table(rows);

  console.log(`
▸ Interpretación
  - KV cache reutiliza attention state ya computado para prefijos compatibles.
  - La diferencia de timing puede ser pequeña con prompts cortos — mide, no asumas.
  - No confundir con RAG ni memoria persistente del asistente.
`);

  // Limpieza caller-managed cache (opcional pedagógico)
  try {
    await deleteCache({ kvCacheKey: SESSION_KEY, modelId });
    console.log("▸ deleteCache({ kvCacheKey }) ejecutado para la sesión demo.");
  } catch (cacheErr) {
    console.error("▸ deleteCache no disponible o falló:", cacheErr);
  }
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
