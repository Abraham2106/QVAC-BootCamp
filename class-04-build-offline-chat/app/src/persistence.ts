import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { CommittedHistory } from "./history.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "..", "data", "conversation.json");

export interface StoredConversation {
  version: 1;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  messages: CommittedHistory["messages"];
}

/** TODO: load and validate persisted history; return empty on missing file */
export async function loadHistory(): Promise<CommittedHistory> {
  return { messages: [] };
}

/** TODO: atomic save (write temp + rename) */
export async function saveHistory(history: CommittedHistory): Promise<void> {
  await mkdir(dirname(DATA_FILE), { recursive: true });
  // implement atomic write
  void history;
  void writeFile;
}
