import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import HeroMesh from '../components/HeroMesh'
import Reveal from '../components/Reveal'
import Badge from '../components/Badge'
import FeatureCard from '../components/FeatureCard'
import LinkButton from '../components/LinkButton'
import ClassPreviewCard from '../components/ClassPreviewCard'
import useUiMode from '../hooks/useUiMode'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LEVELS, MODULES, TEACHING } from '../data/curriculum'
import { getRecommendedClassHref, useContinueLink } from '../hooks/useProgress'

export default function HomeDocs() {
  const { href, label } = useContinueLink('/curriculum', 'Ver currículo completo')
  const { isNinja } = useUiMode()
  const reduceMotion = useReducedMotion()
  const continueHref = getRecommendedClassHref(MODULES.flatMap((mod) => mod.classes))

  const ctaSpring =
    isNinja && !reduceMotion
      ? {
          whileHover: { scale: 1.02 },
          whileTap: { scale: 0.98 },
          transition: { type: 'spring', stiffness: 420, damping: 26 },
        }
      : {}

  return (
    <>
      <section className="hero container">
        <HeroMesh />
        <Reveal>
          <span className="kicker">Bootcamp · Proyecto Albatross · Hackathon QVAC</span>
          <h1 className="display">
            The <span className="grad-word">Local-First</span>
            <br />
            AI Systems Masterclass
          </h1>
          <div className="rule" />
          <p className="lede">
            Doce clases para diseñar, construir, medir, romper y defender sistemas de IA que ejecutan su
            inferencia en tu propia máquina — de tu primer token offline a una malla de inteligencia entre
            dispositivos.
          </p>
          <p className="lede lede--meta">
            Baseline técnico: <strong>QVAC SDK v0.18.x / v0.18.1</strong> · verificado contra documentación
            oficial y npm.
          </p>
          <div className="cta-row">
            <motion.div {...ctaSpring}>
              <LinkButton to="/class/01">Empezar Clase 1 →</LinkButton>
            </motion.div>
            <LinkButton to={href} variant="ghost">
              {label}
            </LinkButton>
          </div>
        </Reveal>
      </section>

      <section className="section container" aria-labelledby="prog-title">
        <Reveal>
          <h2 className="stitle" id="prog-title">
            Una progresión, cinco niveles
          </h2>
          <p className="lede section-intro">
            Cada nivel amplía la arquitectura anterior en lugar de descartarla. Lo que construyes en la Clase 1
            sigue corriendo en el capstone.
          </p>
        </Reveal>
        <div className="levels">
          {LEVELS.map((lvl, i) => (
            <Reveal key={lvl.title} delay={i * 70} className="level-wrap">
              <Card size="sm" className="level h-full">
                <CardHeader className="gap-1.5 pb-(--card-spacing)">
                  <CardTitle className="text-sm font-semibold">{lvl.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed">{lvl.desc}</CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section container" aria-labelledby="how-title">
        <Reveal>
          <h2 className="stitle" id="how-title">
            Cómo se enseña (y cómo se aprende)
          </h2>
        </Reveal>
        <div className="grid grid--3">
          {TEACHING.map((item, i) => (
            <Reveal key={item.tag} delay={i * 80} className="h-full">
              <FeatureCard tag={item.tag} title={item.title} body={item.body} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section container" aria-labelledby="now-title">
        <Reveal>
          <h2 className="stitle" id="now-title">
            Disponible ahora
          </h2>
        </Reveal>
        <div className="grid grid--3">
          <ClassPreviewCard
            delay={60}
            to="/class/01"
            tag="Clase 01 · Disponible"
            title="Airplane-Mode Intelligence"
            body="¿Qué significa realmente que una app de IA sea local? Provisiona un modelo, ejecuta el Airplane-Mode Test y produce tu primera evidencia medible."
            artifactTags={['lesson', 'slides', 'lab', 'examples', 'challenge', 'checkpoint']}
            isContinueTarget={continueHref === '/class/01'}
          />
          <ClassPreviewCard
            delay={120}
            to="/class/02"
            tag="Clase 02 · Disponible"
            title="Models, GGUF and the QVAC Lifecycle"
            body="Abre la caja negra del modelo: pesos, tokenizer, cuantización, nombres de catálogo y el ciclo de vida completo medido en tu máquina."
            artifactTags={['lesson', 'slides', 'lab', 'examples', 'challenge', 'checkpoint']}
            isContinueTarget={continueHref === '/class/02'}
          />
          <ClassPreviewCard
            delay={180}
            to="/class/03"
            tag="Clase 03 · Disponible"
            title="Local Inference Fundamentals"
            body="Abre el motor: tokenización, bucle autoregresivo, streaming events/final, sampling, contexto, KV cache y TTFT vs throughput medidos en tu máquina."
            artifactTags={['lesson', 'slides', 'lab', 'examples', 'challenge', 'checkpoint']}
            isContinueTarget={continueHref === '/class/03'}
          />
          <ClassPreviewCard
            delay={240}
            to="/class/04"
            tag="Clase 04 · Disponible"
            title="Build the Offline Chat"
            body="Convierte inferencia aislada en aplicación confiable: historial multi-turno, streaming con commit boundary, cancelación, persistencia JSON y verificación offline tras restart."
            artifactTags={['lesson', 'slides', 'lab', 'examples', 'challenge', 'checkpoint']}
            isContinueTarget={continueHref === '/class/04'}
          />
          <ClassPreviewCard
            delay={240}
            to="/curriculum"
            tag="Ruta completa"
            title="Las 12 clases + capstone"
            body="Explora la progresión completa: chat offline, RAG privado, voz, servidor compatible con OpenAI, inferencia delegada P2P y el intelligence mesh final."
            className="is-soon"
            badges={[
              <Badge key="soon1" soon>
                clases 05–12 en producción
              </Badge>,
              <Badge key="soon2" soon>
                capstone
              </Badge>,
            ]}
          />
        </div>
      </section>
    </>
  )
}
