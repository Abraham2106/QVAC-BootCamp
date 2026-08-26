/**
 * Example 03 — Experimento de contexto (salida JSON)
 * ==================================================
 *
 * PROPÓSITO
 *   Misma pregunta final, history corta vs history larga. Medir TTFT y
 *   duración total. NO afirmar ley universal de escalado.
 *
 * PROXY DE TAMAÑO
 *   Sin API de conteo de tokens verificada en este ejemplo, reportamos
 *   message count y character count como proxy de aplicación — NO token count.
 *
 * CÓMO EJECUTAR
 *   npx tsx examples/03-context-experiment.ts
 *   npx tsx examples/03-context-experiment.ts > context-results.json
 */

import {
  close,
  completion,
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  unloadModel,
} from "@qvac/sdk";
import { writeFileSync } from "node:fs";

const FINAL_QUESTION = "¿Cuál es la capital de Costa Rica? Responde en una palabra.";
const GEN = { temp: 0, seed: 42, predict: 16 } as const;

const SHORT_HISTORY = [{ role: "user" as const, content: FINAL_QUESTION }];

const LONG_HISTORY = [
  { role: "user" as const, content: "Hablemos de geografía centroamericana." },
  {
    role: "assistant" as const,
    content:
      "Centroamérica incluye países como Guatemala, Honduras, El Salvador, Nicaragua, Costa Rica y Panamá.",
  },
  { role: "user" as const, content: "¿Qué ríos importantes hay en la región?" },
  {
    role: "assistant" as const,
    content:
      "Entre otros: el Río Lempa, el Río San Juan entre Nicaragua y Costa Rica, y el Río Usumacinta.",
  },
  { role: "user" as const, content: "¿Y volcanes?" },
  {
    role: "assistant" as const,
    content:
      "La Cordillera Volcánica Central de Costa Rica incluye Irazú, Poás y Arenal; en Guatemala destaca el Pacaya.",
  },
  { role: "user" as const, content: "¿Qué biodiversidad tiene Costa Rica?" },
  {
    role: "assistant" as const,
    content:
      "Costa Rica alberga gran biodiversidad relativa a su tamaño: selvas tropicales, manglares y reservas protegidas.",
  },
  { role: "user" as const, content: FINAL_QUESTION },
];

function historyProxy(history: { role: string; content: string }[]) {
  const chars = history.reduce((n, m) => n + m.content.length, 0);
  return {
    messageCount: history.length,
    characterCount: chars,
    label: "proxy de aplicación — NO es token count",
  };
}

async function runCase(
  modelId: string,
  label: string,
  history: { role: string; content: string }[]
) {
  const sentAt = performance.now();
  let ttftMs: number | null = null;
  let text = "";

  const run = completion({
    modelId,
    history,
    stream: true,
    generationParams: GEN,
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
    label,
    historyProxy: historyProxy(history),
    observedTtftMs: ttftMs === null ? null : Math.round(ttftMs),
    observedTotalMs: Math.round(totalMs),
    output: text.trim(),
    stopReason: final.stopReason,
    stats: final.stats
      ? {
          tokensPerSecond: final.stats.tokensPerSecond,
          promptTokens: final.stats.promptTokens,
          completionTokens: final.stats.completionTokens,
        }
      : null,
  };
}

let modelId: string | undefined;

try {
  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    modelConfig: { ctx_size: 4096 },
  });

  const results = {
    experiment: "context-comparison",
    model: "LLAMA_3_2_1B_INST_Q4_0",
    finalQuestion: FINAL_QUESTION,
    generationParams: GEN,
    controlledVariable: "history length (messages/chars proxy)",
    cases: [
      await runCase(modelId, "short-history", SHORT_HISTORY),
      await runCase(modelId, "long-history", LONG_HISTORY),
    ],
    disclaimer:
      "Un solo experimento en una máquina no establece una ley de escalado. " +
      "History más larga implica más trabajo de prompt processing antes del decode.",
  };

  const json = JSON.stringify(results, null, 2);
  if (process.argv.includes("--file")) {
    writeFileSync("context-results.json", json);
    console.error("▸ Escrito context-results.json");
  }
  console.log(json);
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
