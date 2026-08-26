export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CommittedHistory {
  messages: ChatMessage[];
}

/** TODO: append user message to committed history (not provisional stream buffer) */
export function appendUser(history: CommittedHistory, content: string): CommittedHistory {
  return history;
}

/** TODO: append assistant turn ONLY after commit policy allows */
export function appendAssistant(history: CommittedHistory, content: string): CommittedHistory {
  return history;
}

/** Map to QVAC completion history format */
export function toCompletionHistory(history: CommittedHistory) {
  return history.messages.map((m) => ({ role: m.role, content: m.content }));
}
