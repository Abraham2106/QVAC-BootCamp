/**
 * Example 01 — Provisionar un modelo de catálogo (fase RED)
 * =========================================================
 *
 * PROPÓSITO
 *   Descargar un asset de catálogo con downloadAsset() SIN cargarlo en
 *   memoria. Es la única fase de la Clase 1 que requiere conexión.
 *
 * ENTRADA ESPERADA
 *   Ninguna (usa la constante de catálogo LLAMA_3_2_1B_INST_Q4_0).
 *
 * SALIDA ESPERADA
 *   Progreso de descarga en stderr y el assetId al finalizar.
 *
 * QUÉ OBSERVAR
 *   - Los campos p.percentage / p.downloaded / p.total del progreso.
 *   - Que este script NO produce texto: descargar ≠ inferir.
 *   - Si lo interrumpes (Ctrl+C) y lo vuelves a correr, continúa desde
 *     donde quedó: las descargas son reanudables por defecto.
 *
 * CÓMO EJECUTAR
 *   npm i @qvac/sdk && npm pkg set type=module
 *   npx tsx examples/01-provision.ts
 *
 * LIMPIEZA
 *   unloadModel() no aplica aquí (nada se cargó). close() libera el
 *   worker/RPC al terminar.
 *
 * MODIFICACIÓN DEL ESTUDIANTE
 *   Implementa una pausa real: cancela con cancel({ requestId: op.requestId })
 *   al llegar al 50% y verifica que re-corriendo el script la descarga retoma.
 */

import {
  close,
  downloadAsset,
  LLAMA_3_2_1B_INST_Q4_0,
} from "@qvac/sdk";

function mb(n: number): string {
  return (n / 1e6).toFixed(1);
}

try {
  console.log("▸ Fase RED: provisionando asset de catálogo...");
  // downloadAsset() devuelve una promesa "decorada": expone requestId
  // sincrónicamente, antes de que la promesa resuelva. Útil para pausar.
  const op = downloadAsset({
    assetSrc: LLAMA_3_2_1B_INST_Q4_0,
    onProgress: (p) => {
      const line = `▸ ${p.percentage.toFixed(0)}% (${mb(p.downloaded)}/${mb(p.total)} MB)`;
      process.stderr.write(process.stderr.isTTY ? `\r${line}` : `${line}\n`);
      if (p.percentage >= 100 && process.stderr.isTTY) process.stderr.write("\n");
    },
  });

  const assetId = await op;
  console.log(`▸ Asset provisionado (id: ${assetId}).`);
  console.log("▸ Listo: la próxima loadModel() con esta constante puede correr offline.");
} catch (error) {
  console.error("✖", error);
  process.exit(1);
} finally {
  void close();
}
