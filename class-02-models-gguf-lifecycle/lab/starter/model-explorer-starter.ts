/**
 * Model Explorer — STARTER
 * ========================
 *
 * Completa los 6 TODO apoyándote en ../examples/. El script se autoverifica:
 * al pasar imprime "✔ EXPLORER OK".
 *
 * Uso:
 *   npx tsx model-explorer-starter.ts
 *   npx tsx model-explorer-starter.ts --json
 *
 * Modelos por defecto: QWEN3_600M_INST_Q4 y LLAMA_3_2_1B_INST_Q4_0.
 */

import {
  close,
  completion,
  getModelInfo,
  getSystemResources,
  LLAMA_3_2_1B_INST_Q4_0,
  loadModel,
  modelRegistryList,
  QWEN3_600M_INST_Q4,
  unloadModel,
} from "@qvac/sdk";

const AS_JSON = process.argv.includes("--json");
const PROMPT = "Resume en una frase qué es un archivo GGUF.";
const GEN = { temp: 0, seed: 42, predict: 96 };

interface Row { modelo: string; diskMB: string; loadMs: number; ttftMs: number; tps: string }

const rows: Row[] = [];

async function explore(name: string, modelSrc: object): Promise<void> {
  // ------------------------------------------------------------------
  // TODO 1 — Metadata + caché: getModelInfo(modelSrc) dentro de try/catch
  // (verifica la firma contra tu .d.ts). Extrae expectedSize a MB.
  // ------------------------------------------------------------------
  const diskMB = "?"; // reemplázame

  // ------------------------------------------------------------------
  // TODO 2 — Carga medida: performance.now() alrededor de loadModel
  // ({ modelSrc, modelConfig: { ctx_size: 2048 } }); guarda modelId.
  // ------------------------------------------------------------------
  const loadMs = NaN; // reemplázame
  let modelId: string | undefined;

  // ------------------------------------------------------------------
  // TODO 3 — Generación determinista: completion({ modelId, history,
  // stream: true, generationParams: GEN }); mide TTFT (primer contentDelta)
  // y acumula el texto.
  // ------------------------------------------------------------------
  const ttftMs = NaN; // reemplázame
  const tps = "n/a"; // reemplázame con final.stats?.tokensPerSecond

  // ------------------------------------------------------------------
  // TODO 4 — Limpieza por modelo: unloadModel({ modelId, clearStorage:false })
  // en finally propio de esta función.
  // ------------------------------------------------------------------

  rows.push({ modelo: name, diskMB, loadMs: Math.round(loadMs), ttftMs: Math.round(ttftMs), tps });
}

try {
  // ------------------------------------------------------------------
  // TODO 0 — Registro (con red): modelRegistryList en try/catch; imprime
  // cuántos modelos hay. Si falla: aviso y continuar (caché local manda).
  // ------------------------------------------------------------------

  await explore("QWEN3_600M_INST_Q4", QWEN3_600M_INST_Q4);
  await explore("LLAMA_3_2_1B_INST_Q4_0", LLAMA_3_2_1B_INST_Q4_0);

  // ------------------------------------------------------------------
  // Auto-verificación
  // ------------------------------------------------------------------
  const checks = [
    ["dos modelos explorados", rows.length === 2],
    ["cargas medidas", rows.every((r) => Number.isFinite(r.loadMs))],
    ["TTFT medido", rows.every((r) => Number.isFinite(r.ttftMs))],
    ["tok/s presentes", rows.every((r) => r.tps !== "n/a")],
  ];
  for (const [name, ok] of checks) console.log(`${ok ? "✔" : "✖"} ${name}`);
  if (!checks.every(([, ok]) => ok)) process.exit(1);

  if (AS_JSON) console.log("\n" + JSON.stringify(rows, null, 2));
  else {
    console.log("\n▸ Comparación:");
    console.table(rows);
  }
  console.log("\n✔ EXPLORER OK");
} catch (error) {
  console.error("✖ Fallo:", error);
  process.exit(1);
} finally {
  // TODO 5 — Cierre global: void close()
}
