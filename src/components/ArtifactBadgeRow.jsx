import { useState } from 'react'
import ArtifactBadge from './ArtifactBadge'
import { ARTIFACT_GROUP_LABELS, groupArtifactTags } from '../lib/artifactBadges'

const VISIBLE_MAX = 4

export default function ArtifactBadgeRow({ tags = [] }) {
  const [expanded, setExpanded] = useState(false)
  const groups = groupArtifactTags(tags)
  const { all } = groups

  if (!all.length) return null

  const hiddenCount = Math.max(0, all.length - VISIBLE_MAX)
  const visibleIds = expanded ? all : all.slice(0, VISIBLE_MAX)

  const visibleGroups = [
    { key: 'content', ids: groups.content.filter((id) => visibleIds.includes(id)) },
    { key: 'eval', ids: groups.eval.filter((id) => visibleIds.includes(id)) },
    { key: 'meta', ids: groups.meta.filter((id) => visibleIds.includes(id)) },
  ].filter((g) => g.ids.length)

  return (
    <div className="artifact-badge-row">
      <div className="artifact-badge-row__divider" aria-hidden="true" />
      <div className="artifact-badge-row__groups">
        {visibleGroups.map(({ key, ids }) => (
          <div key={key} className="artifact-badge-group">
            <span className="artifact-badge-group__label">{ARTIFACT_GROUP_LABELS[key]}</span>
            <div className="artifact-badge-group__items">
              {ids.map((id) => (
                <ArtifactBadge key={id} id={id} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {hiddenCount > 0 && !expanded && (
        <button
          type="button"
          className="artifact-badge-row__more"
          onClick={() => setExpanded(true)}
          aria-expanded="false"
        >
          +{hiddenCount} más
        </button>
      )}
      {expanded && hiddenCount > 0 && (
        <button
          type="button"
          className="artifact-badge-row__more"
          onClick={() => setExpanded(false)}
          aria-expanded="true"
        >
          Ver menos
        </button>
      )}
    </div>
  )
}
