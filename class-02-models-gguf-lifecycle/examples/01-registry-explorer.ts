/**
 * Example 01 — Model Registry Explorer (fase RED · catálogo)
 * =========================================================
 *
 * PROPÓSITO
 *   Descubrir qué modelos existen, filtrar por cuantización, y consultar
 *   el estado de caché de un asset — ANTES de descargar nada.
 *
 * ENTRADA ESPERADA
 *   Red disponible para el registro (si falla, el ejemplo lo maneja y
 *   sigue con la parte local).
 *
 * SALIDA ESPERADA
 *   Listado resumido del registro + estado de caché de LLAMA_3_2_1B_INST_Q4_0.
 *
 * QUÉ OBSERVAR
 *   - Las constantes del SDK son PUNTEROS al registro, no pesos embebidos.
 *   - getModelInfo expone isCached / expectedSize / cacheFiles (checksum).
 *   - getSystemResources te dice qué RAM tiene tu máquina AHORA.
 *
 * CÓMO EJECUTAR
 *   npx tsx examples/01-registry-explorer.ts
 *
 * LIMPIEZA
 *   close() al final (no se cargó ningún modelo en memoria).
 *
 * MODIFICACIÓN DEL ESTUDIANTE
 *   Cambia el filtro de búsqueda a otra familia (p. ej. "qwen") y compara
 *   cuántas variantes de cuantización existen del mismo modelo base.
 *
 * NOTA DE VERSIONES
 *   La forma exacta de los parámetros de getModelInfo/modelRegistrySearch
 *   debe verificarse contra el .d.ts de @qvac/sdk instalado (la página
 *   API Summary es un índice de alto nivel). Este ejemplo usa los campos
 *   documentados en las páginas oficiales y degrada con elegancia.
 */

import {
  close,
  getModelInfo,
  getSystemResources,
  LLAMA_3_2_1B_INST_Q4_0,
  modelRegistryList,
} from "@qvac/sdk";

try {
  // ---- 1 · Registro distribuido (requiere red) ----
  console.log("▸ [1/3] Consultando el registro distribuido de QVAC...");
  try {
    const entries = await modelRegistryList();
    console.log(`   Modelos en el registro: ${entries.length}`);
    // Muestra los primeros 5 resumidos (el catálogo completo puede ser largo)
    for (const e of entries.slice(0, 5)) {
      console.log(`   · ${e.name ?? "(sin nombre)"} · cuant: ${e.quantization ?? "n/a"} · ${e.expectedSize ? Math.round(e.expectedSize / 1e6) + " MB" : "tamaño n/a"}`);
    }
    console.log("   (usa modelRegistrySearch para filtrar por tipo/engine/cuantización)");
  } catch (registryError) {
    console.log("   ⚠ Registro no disponible ahora:", (registryError as Error).message);
    console.log("   → Las constantes de catálogo siguen siendo usables si el asset está cacheado.");
  }

  // ---- 2 · Estado de caché de un asset concreto ----
  console.log("\n▸ [2/3] Estado de caché de LLAMA_3_2_1B_INST_Q4_0:");
  try {
    // La forma exacta de los parámetros puede variar entre versiones:
    // verifica contra node_modules/@qvac/sdk/dist (.d.ts) si el compilador se queja.
    const info = await getModelInfo(LLAMA_3_2_1B_INST_Q4_0 as never);
    const anyInfo = info as Record<string, unknown>;
    console.log(`   isCached: ${anyInfo.isCached}`);
    if (anyInfo.expectedSize) console.log(`   tamaño esperado: ${Math.round(Number(anyInfo.expectedSize) / 1e6)} MB`);
    if (Array.isArray(anyInfo.cacheFiles)) {
      for (const f of anyInfo.cacheFiles as Array<Record<string, unknown>>) {
        console.log(`   · ${f.filename} · cacheado=${f.isCached} · sha256=${String(f.sha256Checksum).slice(0, 12)}…`);
      }
    }
  } catch (infoError) {
    console.log("   ⚠ getModelInfo no disponible con esta firma:", (infoError as Error).message);
    console.log("   → Verifica la firma exacta en el .d.ts de tu versión (nota de versiones arriba).");
  }

  // ---- 3 · Qué puede tu máquina ----
  console.log("\n▸ [3/3] Recursos de tu máquina:");
  const res = await getSystemResources({ sample: true });
  const caps = (res as { capabilities?: { memory?: { totalBytes?: { status: string; value?: unknown } } } }).capabilities;
  if (caps?.memory?.totalBytes?.status === "supported") {
    const total = Number(caps.memory.totalBytes.value) / 1e9;
    console.log(`   RAM total: ${total.toFixed(1)} GB`);
    console.log(`   Regla Q4 (heurística): teóricamente caben modelos de hasta ~${Math.max(0, Math.floor(total / 0.6))}B parámetros + contexto`);
  } else {
    console.log("   (métrica de memoria no disponible en esta plataforma)");
  }
} catch (error) {
  console.error("✖", error);
  process.exit(1);
} finally {
  void close();
}
