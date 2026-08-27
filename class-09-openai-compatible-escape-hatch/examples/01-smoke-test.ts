const baseURL = (process.env.QVAC_BASE_URL ?? "http://localhost:11434/v1").replace(/\/$/, "");
const model = process.env.QVAC_MODEL ?? "local-model";
const started = performance.now();
const response = await fetch(`${baseURL}/chat/completions`, {
  method: "POST", headers: { "content-type": "application/json", authorization: "Bearer local-development-key" },
  body: JSON.stringify({ model, messages: [{ role: "user", content: "Di únicamente: smoke test OK" }], temperature: 0 }),
});
const text = await response.text();
if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
const data = JSON.parse(text);
console.log(JSON.stringify({ status: response.status, ms: Math.round(performance.now() - started), content: data.choices?.[0]?.message?.content, usage: data.usage ?? null }, null, 2));
