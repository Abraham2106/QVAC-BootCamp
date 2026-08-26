import ModuleSection from '../components/ModuleSection'
import Reveal from '../components/Reveal'
import Badge from '../components/Badge'
import LinkButton from '../components/LinkButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MODULES, CAPSTONE } from '../data/curriculum'

const TOC_LABELS = {
  m1: 'M1 · Primer token local',
  m2: 'M2 · Conocimiento privado',
  m3: 'M3 · Más allá del texto',
  m4: 'M4 · Soberanía drop-in',
  m5: 'M5 · Malla de inteligencia',
}

export default function Curriculum() {
  return (
    <div className="container curriculum-page">
      <section className="section section--tight">
        <Reveal>
          <span className="kicker">Programa completo</span>
          <h1 className="display">Currículo</h1>
          <p className="lede section-intro">
            Doce clases en cinco módulos más un capstone con defensa de arquitectura. Cada clase produce evidencia
            verificable; cada módulo amplía el anterior.
          </p>
        </Reveal>
        <nav className="anchor-tabs" aria-label="Índice de módulos">
          {MODULES.map((mod) => (
            <a key={mod.id} href={`#${mod.id}`}>
              {TOC_LABELS[mod.id] ?? mod.no}
            </a>
          ))}
          <a href="#capstone">★ Capstone</a>
        </nav>
      </section>

      {MODULES.map((mod, i) => (
        <ModuleSection key={mod.id} module={mod} index={i} />
      ))}

      <section className="module-block" id="capstone" aria-labelledby="capstone-title">
        <Reveal>
          <div className="module-head">
            <span className="module-no">FINAL</span>
            <h2 className="module-name" id="capstone-title">Capstone</h2>
          </div>
        </Reveal>
        <div className="grid grid--2">
          <Reveal delay={80}>
            <Card className="capstone-card course-card soon">
              <CardContent className="flex gap-5 items-start pt-(--card-spacing)">
                <span className="class-no">{CAPSTONE.no}</span>
                <div className="class-card__body min-w-0 flex-1">
                  <CardTitle className="text-base font-semibold">{CAPSTONE.title}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">{CAPSTONE.desc}</CardDescription>
                  <div className="badge-row mt-3">
                    <Badge soon>tras completar las 12 clases</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <div className="curriculum-cta">
          <p>¿Listo para la primera evidencia?</p>
          <LinkButton to="/class/01">Empezar Clase 1 →</LinkButton>
        </div>
      </Reveal>
    </div>
  )
}
