# Technical Summary — Class 02: Models, GGUF and the QVAC Lifecycle

## 1. Technical Sheet

- **Session topic:** The physical and logical anatomy of a deployable model: architecture, weights, tensors,
  tokenizer, GGUF, quantization, memory budgets, and QVAC model lifecycle

- **Key concepts:** training checkpoint versus inference artifact, metadata, tensor layout, dtype, block
  quantization, context memory, cold/warm/resident measurements, and model selection under constraints

- **Tools / Frameworks:** QVAC model catalog and lifecycle APIs together with llama.cpp-compatible GGUF
  artifacts

- **Position in the bootcamp:** Opens the black box provisioned in Class 01 and prepares the learner to
  understand token-level inference in Class 03

---

## 2. Synopsis

The word model is dangerously overloaded. It can refer to an architecture, a trained set of numerical
  parameters, a family name, a tokenizer package, a checkpoint, a quantized file, or a runtime object already
  resident in memory. The class separates these meanings because each answers a different systems question and
  fails in a different way.

A training checkpoint is designed around training workflows: reconstruction of the network, resumption of
  optimization, framework-specific configuration, and sometimes optimizer state. A deployment artifact is
  designed to execute inference efficiently under a particular runtime. GGUF belongs to this second category:
  it packages tensor descriptions, metadata, tokenizer information, and model data in a structure that a
  compatible inference engine can interpret.

Quantization is then derived as a numerical approximation rather than described as a magical compression
  switch. Reducing representation precision can reduce storage and memory traffic, but its effect on output
  quality and speed depends on model, quantization scheme, hardware, context, and task. A responsible model
  choice therefore combines resource measurement with task-specific evaluation.

---

## 3. Subtopic Breakdown

### Architecture, parameters, tensors, and tokenizer

Architecture is the plan of computation: layer count, hidden dimensions, attention organization, normalization
  choices, and other structural decisions. Parameters are the learned numerical values that fill this plan.
  Tensors are the multidimensional data structures used to store and operate on those values, while dtype
  defines how each numeric element is represented in memory.

The tokenizer is separate from the weights but inseparable from correct use. It maps text into the identifiers
  the model was trained to interpret and maps generated identifiers back to text. Vocabulary, special tokens,
  and chat template determine how conversation roles and boundaries are encoded. A mismatch may produce
  nonsense even when the weight file itself is intact.

Metadata connects the artifact to the runtime. It identifies architecture details, tensor properties,
  tokenizer data, and other configuration required to reconstruct inference. This is why renaming an arbitrary
  binary file to a GGUF extension cannot make it a valid model.

### GGUF as an inference-oriented structure

A GGUF artifact contains a recognizable header, versioned metadata, tensor descriptors, and aligned tensor
  data. The exact binary specification is not memorized for routine SDK use, but understanding its logical
  blocks explains why a loader can inspect the artifact, allocate resources, and map the stored representation
  into executable operations.

Alignment and layout matter because inference repeatedly reads large tensor regions. A deployment format can
  support efficient mapping and access patterns without carrying the full training framework. That is a
  difference of intention, not a claim that one file format is universally superior for every purpose.

A valid format is only one compatibility layer. The runtime must support the architecture and quantization
  type, the model must fit the available resources, and the application must supply the expected conversation
  structure. Model selection is a constraint problem across all of these layers.

### Quantization as controlled numerical error

In a minimal scalar view, a real value is approximated by a discrete integer together with a scale used for
  reconstruction. The reconstructed value is close to, but generally not identical to, the original. Block
  methods use local scales or additional statistics so that one extreme value does not determine resolution
  for an entire model.

Fewer bits often reduce disk size and memory traffic. That can make a previously impossible model fit or
  improve throughput on a bandwidth-constrained path. It can also alter logits enough to affect a task where
  small ranking differences matter. No file-name suffix alone tells the learner whether that tradeoff is
  acceptable.

Requantizing an already quantized artifact approximates an approximation and may accumulate error. It can be a
  practical emergency choice, but the provenance should state the source precision and the final method so
  results are not compared as if both artifacts came directly from the original weights.

### Resource accounting and model selection

File size is not peak memory. Runtime residency may include mapped weights, transformed buffers, backend
  allocations, context state, and KV cache. A model can fit comfortably on disk yet fail during initialization
  or on the first long-context request. The measurement must use the intended context configuration and leave
  margin for the application itself.

Cold load, warm load, and already-resident inference are different experiments. Cold load can include
  filesystem and operating-system cache effects; warm load may reuse cached pages; resident inference omits
  loading entirely. A benchmark must name the condition or its number cannot be interpreted.

A fair selection holds prompt, generation parameters, task examples, backend, and system load as constant as
  practical. It records quality failures as well as load time, TTFT, throughput, and memory. The winner is the
  artifact that satisfies the product constraints, not automatically the smallest or fastest file.

---

## 4. Points of Confusion and Corner Cases

**Model family versus model artifact.**
A family name does not identify the exact parameter count, instruction tuning, quantization, tokenizer
  package, or file revision used in an experiment. Reproducibility requires the concrete artifact and
  configuration.

**Disk size versus resident memory.**
The bytes stored in GGUF are only one part of the working set. Context, caches, buffers, and backend
  allocations can dominate the remaining headroom.

**Quantization versus guaranteed acceleration.**
Reducing bits may reduce bandwidth and memory pressure, but runtime kernels, hardware support, and conversion
  overhead determine whether a particular deployment becomes faster.

**Small degradation versus irrelevant degradation.**
An average benchmark difference that looks small can still be decisive for a narrow product task. Conversely,
  a measurable benchmark loss may have no observable effect on the intended workflow. Test the actual task.

---

## 5. Study Questions

1. Explain architecture, parameters, tensors, dtype, tokenizer, metadata, and runtime without using the word
  model as a shortcut.

2. Why is a training checkpoint not automatically an efficient local inference artifact? Identify at least
  three deployment concerns.

3. Describe a minimal quantization-and-reconstruction process and identify where numerical error enters.

4. Design a controlled comparison between a smaller high-precision model and a larger, more strongly quantized
  model under the same memory limit.

5. Explain why file size, load time, peak memory, TTFT, and tokens per second must appear as separate columns
  in a model-selection report.

---

## Source Material

- [Canonical lesson](../class-02-models-gguf-lifecycle/lesson.md)
