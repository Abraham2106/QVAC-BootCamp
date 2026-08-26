import ClassCard from './ClassCard'
import Reveal from './Reveal'

export default function ModuleSection({ module, index, continueHref }) {
  return (
    <section className="module-block" aria-labelledby={module.id}>
      <Reveal delay={index * 60}>
        <div className="module-head">
          <span className="module-no">{module.no}</span>
          <h2 className="module-name" id={module.id}>
            {module.name}
          </h2>
        </div>
      </Reveal>
      <div className="grid grid--2">
        {module.classes.map((cls, i) => (
          <Reveal key={cls.slug} delay={80 + i * 50}>
            <ClassCard cls={cls} isContinueTarget={!!continueHref && cls.href === continueHref} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
