/**
 * Example 02 — Inferencia offline desde caché (fase LOCAL)
 * ========================================================
 *
 * PROPÓSITO
 *   Demostrar el Airplane-Mode Test: cargar un modelo YA provisionado y
 *   generar texto SIN conexión. Ejecuta primero examples/01-provision.ts.
 *
 * ENTRADA ESPERADA
 *   Asset de catálogo ya descargado (caché válida) + red DESCONECTADA
 *   para la verificación final.
 *
 * SALIDA ESPERADA
 *   Texto generado por streaming (eventos contentDelta) y stats agregadas.
 *
 * QUÉ OBSERVAR
 *   - loadModel() resuelve SIN contactar el registro: valida el caché
 *     contra tamaño/checksum del catálogo.
 *   - Los eventos llegan tipados; contentDelta es tu texto visible.
 *   - Nada en este flujo toca la pila de red.
 *
 * CÓMO EJECUTAR (modo avión)
 *   1. Corre 01-provision.ts con red.
 *   2. Desconecta Wi-Fi / cable.
 *   3. npx tsx examples/02-offline-inference.ts
 *
 * LIMPIEZA
 *   unloadModel() libera memoria del modelo; descargar el último modelo
 *   cierra la conexión RPC automáticamente en Node/Electron y close()
 *   cierra de forma explícita.
 *
 * MODIFICACIÓN DEL ESTUDIANTE
 *   Cambia ctx_size a 4096 y vuelve a medir el tiempo de carga: ¿por qué
 *   cambia si los pesos son los mismos? (Pista: la carga reserva más que pesos.)
 */

import {
  close,
  completion,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
} from "@qvac/sdk";

const PROMPT = "Explícame qué es un modelo de lenguaje en dos frases.";

let modelId: string | undefined;

try {
  console.log("▸ Fase LOCAL: cargando modelo desde caché...");
  const t0 = performance.now();
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 2048 },
  });
  const loadMs = performance.now() - t0;
  console.log(`▸ Modelo cargado (${modelId}) en ${(loadMs / 1000).toFixed(2)} s`);

  const run = completion({
    modelId,
    history: [{ role: "user", content: PROMPT }],
    stream: true,
  });

  let firstTokenMs: number | null = null;
  const promptSentAt = performance.now();

  for await (const event of run.events) {
    if (event.type === "contentDelta") {
      if (firstTokenMs === null) {
        firstTokenMs = performance.now() - promptSentAt;
        console.log(`\n▸ TTFT local: ${(firstTokenMs / 1000).toFixed(3)} s`);
      }
      process.stdout.write(event.text);
    }
    // thinkingDelta, toolCall, etc. existen; esta clase solo usa contenido.
  }

  const final = await run.final;
  console.log(`\n\n▸ stopReason: ${final.stopReason}`);
  if (final.stats?.tokensPerSecond) {
    console.log(`▸ Throughput: ${final.stats.tokensPerSecond.toFixed(1)} tok/s`);
  }
} catch (error) {
  console.error("✖", error);
  process.exit(1);
} finally {
  // Limpieza completa del ciclo de vida: nunca la omitas.
  if (modelId) {
    try {
      await unloadModel({ modelId, clearStorage: false });
      console.log("▸ Modelo descargado de memoria (el asset sigue en disco).");
    } catch (cleanupError) {
      console.error("✖ Fallo durante limpieza:", cleanupError);
    }
  }
  void close();
}
