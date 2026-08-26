# Solución del Instructor — field-provision

> Material para instructores. La referencia NO es la única solución válida: cualquier implementación que pase los AT y resista la defensa oral es aceptable.

## 1. Arquitectura de referencia

```text
field-provision.ts (CLI, sin dependencias más allá de @qvac/sdk)
│
├─ parseArgs()            → modo (provision | verify) + flags
├─ provisionMode()
│    └─ downloadAsset({ assetSrc: CATÁLOGO, onProgress })   ← única op de red
├─ verifyOfflineMode()
│    ├─ preflightCache()   → getModelInfo / estado conocido; aborta ANTES
│    │                       de loadModel si no hay caché (AT3)
│    ├─ loadModel(...)     ← local
│    ├─ completion(...)    ← local (events + final)
│    └─ metrics summary
└─ cleanup(modelId?)      → unloadModel + close SIEMPRE (finally)
```

Decisiones clave:

- Un solo proceso, dos subcomandos. `verify --offline` jamás llama `downloadAsset` — la ausencia de caché se detecta antes de cargar.
- El flag `--offline` es declarativo (documenta intención); la garantía real es el test en red cortada.

## 2. Por qué satisface los acceptance tests

| AT | Mecanismo |
|----|-----------|
| AT1 | `downloadAsset` con `onProgress` imprime %/bytes; reanudable por defecto |
| AT2 | Caché válida → `loadModel` valida checksum sin registro → `completion` genera |
| AT3 | Preflight consulta el estado de caché y sale con exit 2 y mensaje `fase: caché/provisión` antes de tocar `loadModel` |
| AT4 | Cancelar con Ctrl+C deja parcial en disco; re-corrida retoma (descargas reanudables por defecto) |
| AT5 | Bloque `finally` único: si hay `modelId`, `unloadModel`; luego `close()`; errores de limpieza se reportan sin enmascarar el error original |

## 3. Implementación núcleo (esqueleto funcional)

```ts
import {
  close, completion, downloadAsset, getModelInfo,
  loadModel, LLAMA_3_2_1B_INST_Q4_0, unloadModel,
} from "@qvac/sdk";

const MODEL = LLAMA_3_2_1B_INST_Q4_0;

async function provision(): Promise<void> {
  const op = downloadAsset({
    assetSrc: MODEL,
    onProgress: (p) => process.stderr.write(
      `\r${p.percentage.toFixed(0)}% (${(p.downloaded / 1e6).toFixed(1)} MB)`),
  });
  await op;
  console.log("\n✔ provision completo");
}

async function verifyOffline(): Promise<number> {
  // Preflight: fallar ANTES de loadModel si no hay caché (AT3).
  // getModelInfo expone isCached/expectedSize para assets de catálogo;
  // verifica el shape exacto contra tu versión instalada (.d.ts).
  const info = await getModelInfo({ modelIdOrConstant: MODEL as never })
    .catch(() => null);
  if (!info || info.isCached === false) {
    console.error("✖ fase: caché/provisión — asset no presente. Corre 'provision' con red.");
    return 2;
  }

  let modelId: string | undefined;
  try {
    const t0 = performance.now();
    modelId = await loadModel({ modelSrc: MODEL, modelConfig: { ctx_size: 2048 } });
    const loadMs = performance.now() - t0;

    const sentAt = performance.now();
    let ttftMs: number | null = null;
    const run = completion({
      modelId,
      history: [{ role: "user", content: "Prueba de campo: responde OK." }],
      stream: true,
    });
    for await (const ev of run.events) {
      if (ev.type === "contentDelta") {
        if (ttftMs === null) ttftMs = performance.now() - sentAt;
        process.stdout.write(ev.text);
      }
    }
    const final = await run.final;
    printSummary({ loadMs, ttftMs, tps: final.stats?.tokensPerSecond ?? null,
                   stopReason: final.stopReason });
    return 0;
  } finally {
    if (modelId) { try { await unloadModel({ modelId, clearStorage: false }); }
                   catch (e) { console.error("limpieza:", e); } }
    void close();
  }
}
```

> Nota honesta: el parámetro exacto de `getModelInfo` debe verificarse contra el `.d.ts` de la versión instalada (el API Summary lo lista sin ejemplo). Si el equipo prefiere cero ambigüedad, el preflight alternativo válido es intentar `loadModel` y clasificar el error por su mensaje — pero entonces AT3 exige mapear ese error a "fase: caché/provisión" explícitamente.

## 4. Comportamiento observable esperado

- **AT1:** progreso en una sola línea (stderr TTY), termina con assetId/validación.
- **AT2 offline:** carga en ~1–3 s en hardware típico de laptop; texto inmediato tras TTFT; métricas impresas.
- **AT4:** segunda corrida arranca en >50% (retoma), nunca desde 0%.
- **AT3/AT5:** exit codes diferenciados (2 = caché ausente; 1 = fallo runtime), limpieza siempre ejecutada.

## 5. Comportamiento de fallo esperado

- Sin caché + offline + `verify` → mensaje de fase provisión, exit 2, sin stack ruidoso.
- Caché corrupta/movida → la validación checksum de catálogo rechaza en carga; el mensaje menciona validación/tamaño, no DNS.
- OOM por `ctx_size` excesivo → fallo en fase de carga o primera inferencia, según plataforma.

## 6. Mediciones esperadas (rango orientativo en laptop moderna — NO valores oficiales)

- Carga fría: mayor que carga tibia (SSD cachea lecturas).
- TTFT local: decenas–cientos de ms para prompt corto en 1B Q4.
- tok/s: dominado por ancho de banda de memoria en CPU.
Estos rangos existen solo para que el instructor reconozca resultados absurdos; cada estudiante reporta los suyos.

## 7. Soluciones incorrectas comunes

1. `verify --offline` que intenta descargar y "maneja" el error → viola AT3 por diseño (la detección debe ser previa).
2. Falta de `unloadModel` en caminos de error → proceso colgado o memoria retenida (falla AT5).
3. Usar ruta local fija hardcodeada de otra máquina → rompe portabilidad y confunde clasificación de dependencias.
4. Medir TTFT con `Date.now()` después de imprimir un banner → mide I/O de consola, no inferencia.
5. Afirmar "100% offline" sin test de red cortada → promesa no verificada.

## 8. Hints de debugging

- Error menciona *registry/download* en `verify` → hay una llamada de descarga fugitiva; búscala.
- Proceso no termina tras `unloadModel` → falta `close()` o quedó un stream abierto.
- Métricas imposibles (TTFT < 10 ms) → revisa qué estás cronometrando realmente.

## 9. Arquitecturas alternativas válidas

- Dos procesos separados (`provision` / `verify`) comunicados solo por el estado de la caché — igualmente válida si pasa los AT.
- Preflight por clasificación de errores en vez de consulta previa de caché — válido si AT3 queda demostrado.
- Wrapper TypeScript con tipos propios sobre las constantes — válido; lo que importa es la frontera red/local.

## 10. Preguntas de defensa oral

1. ¿Qué valida exactamente QVAC al cargar desde caché y quién firma esa confianza?
2. Tu `provision` fue interrumpido al 40%. Explica byte a byte qué encuentra el SDK en la siguiente corrida.
3. ¿Qué parte de tu tool seguiría funcionando si mañana el registro de modelos cambia de URL? ¿Y qué dejaría de funcionar?
4. ¿Por qué mediste TTFT manualmente aunque el runtime reporta stats? ¿Qué capturas tú que el runtime no?
5. Si la ONG añade telemetría opcional, ¿cómo cambiaría tu tabla de clasificación de dependencias sin romper AT2?
