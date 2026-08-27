// Relay didáctico. Sustituye adaptadores por QVAC ASR/TTS y
// Bergamot o qvac-fabric-llm.cpp.
export function createVoiceRelay({ translate, tts, onEvent = () => {} }) {
  let latestSegment = -1;
  let closed = false;

  return {
    async pushTranscript({ segmentId, text, final = false }) {
      if (closed || segmentId < latestSegment) return;
      latestSegment = Math.max(latestSegment, segmentId);
      onEvent({ type: "asr", segmentId, text, final });
      if (!final) return; // parcial: UI únicamente

      try {
        const started = performance.now();
        const targetText = await translate(text);
        onEvent({ type: "translation", segmentId, sourceText: text,
          targetText, durationMs: performance.now() - started });
        if (closed || segmentId !== latestSegment) return;
        const audio = await tts(targetText);
        if (closed || segmentId !== latestSegment) return;
        await audio.play();
        onEvent({ type: "played", segmentId });
      } catch (error) {
        onEvent({ type: "stage-error", segmentId, error: String(error) });
      }
    },
    close() { closed = true; onEvent({ type: "closed" }); },
  };
}

export const fakeTranslate = async text => text.replace("hola", "hello");
export const fakeTts = async text => ({ play: async () => text });