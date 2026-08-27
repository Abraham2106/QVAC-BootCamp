/** Clase 9 — completa los TODOs. Ejecutar con: npx tsx client-starter.ts [--stream] */
const baseURL = (process.env.QVAC_BASE_URL ?? "http://localhost:11434/v1").replace(/\/$/, "");
const model = process.env.QVAC_MODEL ?? "local-model";
const stream = process.argv.includes("--stream");

type ChatResponse = { choices?: Array<{ message?: { content?: string }; delta?: { content?: string } }>; error?: { message?: string } };

async function main() {
  const started = performance.now();
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer local-development-key" },
    body: JSON.stringify({ model, messages: [{ role: "user", content: "Responde exactamente: QVAC local." }], temperature: 0, stream }),
  });
  // TODO 1: si !response.ok, lee el cuerpo sin asumir que es JSON y lanza un error útil.
  // TODO 2: en modo normal, parsea JSON y extrae choices[0].message.content.
  // TODO 3: en modo stream, recorre response.body, detecta data: y [DONE].
  // TODO 4: imprime status, TTFT y duración total sin imprimir secretos.
  void started;
  void response;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
