/**
 * Example 03 — Memory Report: ¿qué puede mi máquina?
 * ==================================================
 *
 * PROPÓSITO
 *   Convertir getSystemResources en una recomendación accionable usando
 *   la heurística de cuantización de la lección (Q4 ≈ 0.5–0.6 GB por 1B
 *   parámetros + margen de contexto).
 *
 * ENTRADA ESPERADA
 *   Nada. Todo se mide en tu máquina.
 *
 * SALIDA ESPERADA
 *   Reporte: RAM total, RAM disponible, disco libre, y la escala máxima
 *   de modelo Q4 que teóricamente cabe — con el margen de contexto aparte.
 *
 * QUÉ OBSERVAR
 *   - La RAM DISPONIBLE manda, no la total (el SO y tus apps ya usan parte).
 *   - La heurística es RECOMENDADA, no garantía: el contexto y el runtime
 *     consumen extra. La confirmación final siempre es cargar y medir.
 *   - `qvac doctor` (CLI) valida el subset machine-readable de requisitos.
 *
 * CÓMO EJECUTAR
 *   npx tsx examples/03-memory-report.ts
 *
 * LIMPIEZA
 *   close() (no se cargan modelos).
 *
 * MODIFICACIÓN DEL ESTUDIANTE
 *   Añade el chequeo de disco libre (fs.statfsSync en Node 18.15+) y
 *   compáralo con el requisito documentado de ≥ 5 GB.
 */

import { close, getSystemResources } from "@qvac/sdk";

// Heurística de la lección — RECOMENDADA, no garantía:
const GB_POR_1B_Q4 = 0.6;    // ~0.5–0.6 GB por mil millones de parámetros en Q4
const MARGEN_RUNTIME_GB = 1.5; // contexto + runtime + sistema (colchón prudente)

function gb(bytes: unknown): number | null {
  const n = Number(bytes);
  return Number.isFinite(n) && n > 0 ? n / 1e9 : null;
}

try {
  console.log("▸ Reporte de recursos (getSystemResources · sample:true)...\n");
  const res = await getSystemResources({ sample: true });
  const r = res as {
    capabilities?: {
      memory?: {
        totalBytes?: { status: string; value?: unknown };
        availableBytes?: { status: string; value?: unknown };
      };
    };
    sample?: Record<string, { status: string; value?: unknown }>;
  };

  const total = gb(r.capabilities?.memory?.totalBytes?.value);
  // Algunas plataformas exponen disponible dentro de sample; otras en capabilities.
  const available =
    gb(r.capabilities?.memory?.availableBytes?.value) ??
    gb(r.sample?.memoryAvailable?.value) ??
    gb(r.sample?.memoryFree?.value);

  if (total !== null) console.log(`   RAM total:      ${total.toFixed(1)} GB`);
  console.log(`   RAM disponible: ${available !== null ? available.toFixed(1) + " GB" : "no reportada en esta plataforma"}`);
  console.log(`   Requisito documentado: total ≥ 2 GB · recomendado ≥ 4 GB ("por debajo de 4 GB, la mayoría de los LLMs fallan al cargar")`);

  const usable = available ?? (total !== null ? total - MARGEN_RUNTIME_GB : null);
  if (usable !== null) {
    const maxB = Math.max(0, (usable - MARGEN_RUNTIME_GB) / GB_POR_1B_Q4);
    console.log(`\n▸ Heurística Q4 (0.6 GB/1B + ${MARGEN_RUNTIME_GB} GB de margen):`);
    console.log(`   escala teórica máxima ≈ ${maxB.toFixed(1)}B parámetros`);
    if (maxB >= 7) console.log("   → un 7B Q4 es candidato razonable en esta máquina");
    else if (maxB >= 3) console.log("   → apunta a modelos 1B–3B; un 7B Q4 va muy justo");
    else console.log("   → quédate con modelos pequeños (≤ 1B) o sube RAM");
    console.log("\n   ⚠ Heurística para decidir qué PROBAR. La verdad final: cargar y medir (examples/02).");
  }
} catch (error) {
  console.error("✖", error);
  process.exit(1);
} finally {
  void close();
}
