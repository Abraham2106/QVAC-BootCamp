/**
 * Example 05 — Local JSON persistence
 * ====================================
 * Save/load committed conversation history (application concern).
 *
 * npx tsx examples/05-persistence.ts
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

interface StoredConversation {
  version: 1;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "conversation.json");

async function save(conv: StoredConversation): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = FILE + ".tmp";
  await writeFile(tmp, JSON.stringify(conv, null, 2), "utf8");
  await writeFile(FILE, JSON.stringify(conv, null, 2), "utf8");
  console.log("▸ Saved to", FILE);
}

async function load(): Promise<StoredConversation | null> {
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as StoredConversation;
    if (parsed.version !== 1 || !Array.isArray(parsed.messages)) {
      throw new Error("Invalid schema");
    }
    return parsed;
  } catch {
    return null;
  }
}

const now = new Date().toISOString();
const conv: StoredConversation = {
  version: 1,
  conversationId: crypto.randomUUID(),
  createdAt: now,
  updatedAt: now,
  messages: [
    { role: "user", content: "Hello offline chat." },
    { role: "assistant", content: "Persisted after commit boundary." },
  ],
};

await save(conv);
const restored = await load();
console.log("▸ Restored messages:", restored?.messages.length);
console.log("▸ Last message:", restored?.messages.at(-1)?.content);
