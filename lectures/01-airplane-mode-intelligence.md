# Technical Summary — Class 01: Airplane-Mode Intelligence

## 1. Technical Sheet

- **Session topic:** Operational ownership of an AI inference path: provisioning, local model residency,
  offline execution, data boundaries, and the Airplane-Mode Test

- **Key concepts:** on-device inference, local-first versus local-only, model cache, download/load/inference
  lifecycle, TTFT, failure domains, privacy, and reproducible evidence

- **Tools / Frameworks:** QVAC SDK lifecycle primitives such as downloadAsset(), loadModel(), completion(),
  unloadModel(), and close()

- **Position in the bootcamp:** The opening class. It replaces the vague claim “this AI is local” with an
  architecture that can be inspected, measured, falsified, and defended

---

## 2. Synopsis

A chat window drawn on a laptop is not evidence that inference occurs on that laptop. In a cloud-centered
  path, the prompt leaves the device, crosses a network, enters infrastructure owned by another party, waits
  for scheduling, reaches a remote accelerator, and returns as generated tokens. The interface is local while
  the decisive computation, model weights, and several failure domains are remote.

Local inference changes that route. The model artifact must be available inside the declared local boundary, a
  compatible runtime must load it, and the device must perform the operations that produce each new token.
  Removing the network from the critical request path can improve control and offline availability, but it
  also transfers responsibility for storage, memory, hardware compatibility, updates, energy use, and
  lifecycle management to the application owner.

The class culminates in a falsifiable Airplane-Mode Test. The learner provisions the model while connected,
  shuts down the application, disables connectivity, restarts from durable local state, asks a question that
  was never answered before, and records a fresh completion. This procedure rules out the easiest false
  positives: cached responses, a still-running remote session, and a demo that never exercised restart
  behavior.

---

## 3. Subtopic Breakdown

### The route that a cloud abstraction hides

A cloud client can collapse a long systems path into one innocent-looking method call. Behind it sit
  serialization, DNS, transport security, authentication, rate limits, a remote queue, model placement,
  accelerator execution, and streaming back to the client. Every stage contributes latency and introduces an
  owner who may observe, retain, reject, or alter the request.

Tracing the route is more useful than debating whether cloud or local is universally better. It reveals which
  bytes cross each boundary, which components remain available during an outage, and which organization
  controls the model version. The same exercise later applies to vector stores, speech pipelines, compatible
  HTTP servers, and delegated inference.

A local-first design can still use a network for optional synchronization, model downloads, or an explicitly
  authorized fallback. The essential question is what function remains when the network disappears and whether
  the user or application policy controls the decision to leave the device.

### Download, cache, load, and inference are different verbs

Downloading transfers an asset. Validation establishes that the expected bytes arrived intact. Caching gives
  those bytes a durable location. Loading creates runtime state and makes the model available for requests.
  Inference consumes prompt state and compute to produce a new result. Treating all five stages as “running
  the model” makes failures almost impossible to classify correctly.

A partial file can exist without being loadable. A complete cached file can exist while no model is resident
  in memory. A resident model can serve many requests without downloading or loading again. Unloading can
  release runtime resources while intentionally preserving the cached asset for the next offline start.

This separation also clarifies measurement. Download duration measures provisioning and network conditions.
  Load duration measures local storage, mapping, initialization, and hardware setup. TTFT includes request
  preparation and prefill. Tokens per second describes sustained decode. Combining them into a single speed
  number erases the mechanism the class is trying to expose.

### The Airplane-Mode Test as an engineering experiment

A credible test begins with a written hypothesis and a declared boundary. For example: after one connected
  provisioning run, this application can be fully terminated, restarted without Internet, and produce a new
  completion using the selected model and local transcript. The wording matters because a weaker claim may
  accidentally allow a cached answer or a background process that never stopped.

Evidence should include the model identifier, cache location or model information available to the
  application, timestamps for startup and generation, the observed first delta, terminal stop reason, and the
  network condition. Sensitive prompt text does not need to be copied into logs merely to prove that
  generation occurred.

A failed test is valuable. It can reveal an unprovisioned shard, a changed cache directory, model discovery
  that still depends on a registry, startup telemetry treated as mandatory, or an inference route that was
  remote all along. Each diagnosis points to a different correction.

### Privacy and failure domains after moving inference

On-device generation can prevent the prompt from being sent to a remote inference provider, but it does not
  make the entire product private. Prompts and responses may still be written to transcripts, debug logs,
  crash reports, backups, clipboard history, or later retrieval indexes. Privacy analysis follows bytes and
  retention, not product labels.

Failure domains also move. A cloud service may fail because of DNS, credentials, quota, provider outage, or
  remote queueing. A local system may fail because the asset is missing, storage is full, RAM is insufficient,
  a native addon is incompatible, or the device suspends mid-request. Local ownership means owning these
  recovery paths as well as the successful demo.

---

## 4. Points of Confusion and Corner Cases

**Local UI versus local inference.**
The physical location of the interface says nothing conclusive about the location of model execution.
  Verification follows the request into the worker or runtime and confirms that fresh tokens are produced
  without a remote service.

**Offline-capable versus never needing a network.**
A local system may require a connected provisioning phase. Offline capability means the declared operational
  flow works after required assets are present; it does not mean the model materialized without ever being
  downloaded.

**Unload versus delete.**
Releasing a model from memory and removing its durable cached asset solve different problems. Confusing them
  can either waste repeated downloads or leave data that a deletion policy claimed to remove.

**Local versus automatically private.**
Local execution removes one data transfer path. It does not address local logs, malware, shared user accounts,
  backups, or optional network features unless those are analyzed separately.

---

## 5. Study Questions

1. Draw the complete route of a prompt through a cloud API and through an on-device QVAC runtime. Mark every
  network, ownership, and persistence boundary.

2. Explain why disconnecting Wi-Fi after a response has already started is weaker evidence than restarting the
  application offline and asking a new question.

3. Classify these failures by phase: missing asset, checksum mismatch, out-of-memory during load, long TTFT,
  and a completion that stops because of its configured length.

4. Design an Airplane-Mode Test that proves fresh inference while avoiding storage of sensitive prompt content
  in the evidence log.

5. Give one architecture that is local-first but not local-only, and state the exact policy that authorizes
  its remote route.

---

## Source Material

- [Canonical lesson](../class-01-airplane-mode-intelligence/lesson.md)
