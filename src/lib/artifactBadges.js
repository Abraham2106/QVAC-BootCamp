/** Metadata for class resource tags shown on course cards. */
export const ARTIFACT_BADGES = {
  lesson: { label: 'Lección', group: 'content', icon: 'book' },
  slides: { label: 'Slides', group: 'content', icon: 'slides' },
  lab: { label: 'Lab', group: 'content', icon: 'play' },
  examples: { label: 'Examples', group: 'content', icon: 'code' },
  challenge: { label: 'Challenge', group: 'eval', icon: 'target' },
  assessment: { label: 'Assessment', group: 'eval', icon: 'check' },
  checkpoint: { label: 'Checkpoint', group: 'eval', icon: 'check' },
  instructor: { label: 'Instructor', group: 'meta', icon: 'instructor' },
  notebooklm: { label: 'NotebookLM', group: 'meta', icon: 'audio' },
}

export const ARTIFACT_GROUP_LABELS = {
  content: 'Contenido',
  eval: 'Evaluación',
  meta: 'Referencia',
}

/** Stable display order; unknown tags are appended at the end. */
export const ARTIFACT_ORDER = [
  'lesson',
  'slides',
  'lab',
  'examples',
  'challenge',
  'assessment',
  'checkpoint',
  'instructor',
  'notebooklm',
]

export function normalizeArtifactTags(tags = []) {
  const set = new Set(tags.map((t) => String(t).toLowerCase()))
  const ordered = ARTIFACT_ORDER.filter((id) => set.has(id))
  for (const t of set) {
    if (!ordered.includes(t) && ARTIFACT_BADGES[t]) ordered.push(t)
  }
  return ordered
}

export function groupArtifactTags(tags = []) {
  const ordered = normalizeArtifactTags(tags)
  return {
    content: ordered.filter((id) => ARTIFACT_BADGES[id]?.group === 'content'),
    eval: ordered.filter((id) => ARTIFACT_BADGES[id]?.group === 'eval'),
    meta: ordered.filter((id) => ARTIFACT_BADGES[id]?.group === 'meta'),
    all: ordered,
  }
}
