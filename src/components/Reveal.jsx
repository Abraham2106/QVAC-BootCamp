import { motion, useReducedMotion } from 'motion/react'

export default function Reveal({ children, className = '', delay = 0 }) {
  const reduceMotion = useReducedMotion()

  // `transition: none` inline neutraliza la transición CSS de `.reveal`
  // para que motion controle la animación sin doble easing.
  return (
    <motion.div
      className={`reveal ${className}`}
      style={{ '--reveal-delay': `${delay}ms`, transition: 'none' }}
      {...(reduceMotion
        ? {}
        : {
            initial: { opacity: 0, y: 18 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, amount: 0.08 },
            transition: { duration: 0.55, ease: 'easeOut', delay: delay / 1000 },
          })}
    >
      {children}
    </motion.div>
  )
}
