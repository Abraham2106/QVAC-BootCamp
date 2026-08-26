/**
 * Example 03 — Medir: descarga, carga, TTFT, throughput
 * =====================================================
 *
 * PROPÓSITO
 *   Instrumentar el ciclo completo para producir TU tabla de métricas.
 *   Corre este ejemplo dos veces (frío y tibio) y compara.
 *
 * ENTRADA ESPERADA
 *   Red disponible la primera vez (descarga); después, solo caché.
 *
 * SALIDA ESPERADA
 *   Un resumen de métricas al final. Los valores son DE TU MÁQUINA:
 *   no existen valores universales ni benchmarks fabricados.
 *
 * QUÉ OBSERVAR
 *   - Descarga (solo si el caché no existe): bytes y % desde onProgress.
 *   - Carga: wall-clock alrededor de loadModel().
 *   - TTFT: primer contentDelta menos envío del prompt (medición manual;
 *     no asumimos nombres de campos de stats más allá del documentado).
 *   - Throughput: final.stats.tokensPerSecond, reportado por el runtime.
 *   - Memoria pico del heap de tu proceso Node (no incluye el worker).
 *
 * CÓMO EJECUTAR
 *   1ª vez: npx tsx examples/03-measure.ts            (con red, mide frío)
 *   2ª vez: desconecta red y corre otra vez           (mide tibio/offline)
 *
 * LIMPIEZA
 *   unloadModel + close, igual que en el ejemplo anterior.
 *
 * MODIFICACIÓN DEL ESTUDIANTE
 *   Añade un muestreo de memoria cada 250 ms durante la generación y
 *   reporta el máximo real observado (no solo el heapUsed final).
 */

import {
  close,
  completion,
  downloadAsset,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
} from "@qvac/sdk";

const PROMPT = "Enumera tres ventajas de la inferencia local.";
let modelId: string | undefined;

function mb(n: number): string {
  return (n / 1e6).toFixed(1);
}

try {
  // ---- FASE RED (se salta sola si el asset ya está cacheado) ----
  console.log("▸ [1/4] Asegurando asset provisionado...");
  const dlStart = performance.now();
  let downloadedBytes = 0;
  await downloadAsset({
    assetSrc: LLAMA_3_2_1B_INST_Q4_0,
    onProgress: (p) => {
      downloadedBytes = p.downloaded;
    },
  });
  const downloadWasNeeded = downloadedBytes > 0;
  const downloadMs = performance.now() - dlStart;
  if (downloadWasNeeded) {
    console.log(`   descargó ${mb(downloadedBytes)} MB en ${(downloadMs / 1000).toFixed(1)} s`);
  } else {
    console.log("   caché válida: sin descarga necesaria");
  }

  // ---- FASE LOCAL: carga ----
  console.log("▸ [2/4] Cargando modelo...");
  const loadStart = performance.now();
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 2048 },
  });
  const loadMs = performance.now() - loadStart;

  // ---- FASE LOCAL: inferencia instrumentada ----
  console.log("▸ [3/4] Generando...");
  const promptSentAt = performance.now();
  let firstTokenMs: number | null = null;
  let tokenEvents = 0;

  const run = completion({
    modelId,
    history: [{ role: "user", content: PROMPT }],
    stream: true,
  });

  for await (const event of run.events) {
    if (event.type === "contentDelta") {
      tokenEvents++;
      if (firstTokenMs === null) firstTokenMs = performance.now() - promptSentAt;
      process.stdout.write(event.text);
    }
  }

  const totalGenMs = performance.now() - promptSentAt;
  const final = await run.final;
  const runtimeTps = final.stats?.tokensPerSecond ?? null;

  // ---- Reporte ----
  console.log("\n\n▸ [4/4] Métricas de ESTA máquina:");
  console.table({
    "descarga requerida": { valor: downloadWasNeeded ? "sí" : "no (caché)" },
    "bytes descargados": { valor: downloadWasNeeded ? `${mb(downloadedBytes)} MB` : "—" },
    "tiempo de descarga": { valor: downloadWasNeeded ? `${(downloadMs / 1000).toFixed(2)} s` : "—" },
    "tiempo de carga": { valor: `${(loadMs / 1000).toFixed(3)} s` },
    "TTFT": { valor: firstTokenMs === null ? "n/a" : `${(firstTokenMs / 1000).toFixed(3)} s` },
    "eventos contentDelta": { valor: String(tokenEvents) },
    "tiempo total de generación": { valor: `${(totalGenMs / 1000).toFixed(3)} s` },
    "tok/s (runtime)": { valor: runtimeTps ? runtimeTps.toFixed(1) : "n/a" },
    "heapUsed final (proceso cliente)": { valor: `${mb(process.memoryUsage().heapUsed)} MB` },
  });
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
