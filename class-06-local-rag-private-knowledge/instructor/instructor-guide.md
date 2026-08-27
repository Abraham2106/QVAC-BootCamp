# Instructor Guide — Clase 06

## Teaching goal

El alumno debe poder abrir un RAG pipeline y señalar exactamente dónde falló.

## Main misconception

“RAG” no es una llamada única ni una garantía anti-hallucination.

## Prerequisite assumption

No reteaches embeddings from scratch. Revisa brevemente `query → vector → similarity → Top-K` y continúa.

## Timing

- 0–15: parametric vs external knowledge
- 15–35: RAG pipeline + chunking
- 35–55: managed workspace demo
- 55–75: Predict + retrieval only
- 75–85: break
- 85–110: grounded generation
- 110–130: Unknown Knowledge Test
- 130–145: Break It retrieval failure
- 145–170: Private Notebook challenge
- 170–180: checkpoint/defense

## Instructor rule

**Never show the answer before showing the retrieved evidence.** The diagnostic boundary is the class.

## Pre-class checklist

- verify current v0.18.x RAG docs/API;
- verify `GTE_LARGE_FP16`, `QWEN3_600M_INST_Q4` and signatures;
- run `ragIngest`, `ragSearch`, `ragCloseWorkspace` examples;
- confirm workspace cleanup semantics;
- prepare an answerable and an intentionally unanswerable query;
- verify no provenance field is fabricated.

## Break It facilitation

Ask students to predict whether the manipulated variable should alter retrieval or generation. Do not reveal the diagnosis until they inspect Top-K.

## Mastery

A student can answer:

> “The answer is wrong. What evidence tells us whether retrieval or generation failed?”

## Transition

Clase 07 changes the data type: text pipelines become speech/audio pipelines, while the same discipline of explicit stages and latency remains.