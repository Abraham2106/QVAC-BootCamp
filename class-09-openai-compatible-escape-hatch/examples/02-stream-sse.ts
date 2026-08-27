const baseURL = (process.env.QVAC_BASE_URL ?? "http://localhost:11434/v1").replace(/\/$/, "");
const model = process.env.QVAC_MODEL ?? "local-model";
const started = performance.now(); let firstDelta: number | null = null; let output = "";
const response = await fetch(`${baseURL}/chat/completions`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ model, messages: [{ role: "user", content: "Explica localhost en una frase." }], temperature: 0, stream: true }) });
if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
const reader = response.body.pipeThrough(new TextDecoderStream()).getReader(); let pending = "";
while (true) { const { value, done } = await reader.read(); if (done) break; pending += value; const lines = pending.split("\n"); pending = lines.pop() ?? ""; for (const line of lines) { if (!line.startsWith("data: ")) continue; const payload = line.slice(6).trim(); if (payload === "[DONE]") continue; const data = JSON.parse(payload); const delta = data.choices?.[0]?.delta?.content ?? ""; if (delta && firstDelta === null) firstDelta = performance.now(); output += delta; process.stdout.write(delta); } } 
console.log(`\n${JSON.stringify({ ttftMs: firstDelta === null ? null : Math.round(firstDelta - started), durationMs: Math.round(performance.now() - started), chars: output.length })}`);
