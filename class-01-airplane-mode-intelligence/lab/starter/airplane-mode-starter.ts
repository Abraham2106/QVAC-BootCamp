/**
 * Airplane-Mode Proof — STARTER
 * =============================
 *
 * Completa los TODO apoyándote en ../examples/. Cada TODO corresponde a
 * una llamada documentada de la Clase 1. El script se autoverifica: al
 * pasar, imprime "✔ CICLO COMPLETO OK".
 *
 * Uso:
 *   npx tsx airplane-mode-starter.ts            (corrida A, con red)
 *   npx tsx airplane-mode-starter.ts --offline  (corrida B, modo avión)
 *
 * El flag --offline NO corta tu red por ti: desconéctala tú y usa el
 * flag para declarar la intención. Si algo intenta descargar, el script
 * debe fallar nombrando la fase exacta.
 */

import {
  close,
  completion,
  downloadAsset,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
} from "@qvac/sdk";

const OFFLINE = process.argv.includes("--offline");
const PROMPT = "Resume en una frase qué significa local-first.";

let modelId: string | undefined;
let downloadAttempted = false;

try {
  console.log(`▸ Modo: ${OFFLINE ? "OFFLINE (declarado)" : "con red"}`);

  // ------------------------------------------------------------------
  // TODO 1 — Fase RED: provisiona el asset SOLO si NO estamos en modo
  // offline. En modo offline, esta fase debe saltarse con un mensaje.
  // Pista: envuelve downloadAsset() y marca downloadAttempted = true.
  // ------------------------------------------------------------------

  // ...tu código aquí...

  if (!downloadAttempted && OFFLINE) {
    console.log("▸ Fase RED omitida (modo offline declarado).");
  }

  // ------------------------------------------------------------------
  // TODO 2 — Fase LOCAL (carga): mide wall-clock alrededor de loadModel()
  // con ctx_size 2048 y guarda el valor en loadMs.
  // ------------------------------------------------------------------
  const loadMs = NaN; // reemplázame

  // ------------------------------------------------------------------
  // TODO 3 — Fase LOCAL (inferencia): itera run.events, imprime cada
  // contentDelta, mide TTFT (primer contentDelta − envío del prompt) y
  // cuenta los eventos en tokenEvents.
  // ------------------------------------------------------------------
  const promptSentAt = performance.now();
  let firstTokenMs: number | null = null;
  let tokenEvents = 0;

  // const run = completion({ ... });
  // for await (const event of run.events) { ... }

  const totalGenMs = performance.now() - promptSentAt;

  // ------------------------------------------------------------------
  // TODO 4 — Agregadas: obtén final = await run.final; extrae
  // final.stats?.tokensPerSecond y final.stopReason.
  // ------------------------------------------------------------------
  const runtimeTps: number | null = null; // reemplázame
  let stopReason = "n/a"; // reemplázame

  // ------------------------------------------------------------------
  // Auto-verificación: no modificar la lógica, solo complétala si falta.
  // ------------------------------------------------------------------
  const checks = [
    ["tiempo de carga medido", Number.isFinite(loadMs)],
    ["TTFT medido", firstTokenMs !== null],
    ["hubo contenido", tokenEvents > 0],
    ["stopReason presente", stopReason !== "n/a"],
  ];
  for (const [name, ok] of checks) {
    console.log(`${ok ? "✔" : "✖"} ${name}`);
  }
  if (!checks.every(([, ok]) => ok)) process.exit(1);

  console.log("\n▸ Métricas de esta corrida:");
  console.table({
    "tiempo de carga": `${(loadMs / 1000).toFixed(3)} s`,
    TTFT: `${((firstTokenMs ?? 0) / 1000).toFixed(3)} s`,
    "eventos contentDelta": String(tokenEvents),
    "generación total": `${(totalGenMs / 1000).toFixed(3)} s`,
    "tok/s (runtime)": runtimeTps ? runtimeTps.toFixed(1) : "n/a",
    stopReason,
  });

  console.log("\n✔ CICLO COMPLETO OK");
} catch (error) {
  console.error("✖ Fallo:", error);
  if (OFFLINE && downloadAttempted) {
    console.error("✖ Un intento de descarga ocurrió en modo offline: clasifica esta dependencia.");
  }
  process.exit(1);
} finally {
  // ------------------------------------------------------------------
  // TODO 5 — Limpieza: si modelId existe, unloadModel({ clearStorage: false })
  // dentro de try/catch propio; luego void close().
  // ------------------------------------------------------------------
}
