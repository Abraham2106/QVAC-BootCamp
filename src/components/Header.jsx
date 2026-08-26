import { Link, NavLink } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import ThemeToggle from './ThemeToggle'
import UiModeToggle from './UiModeToggle'

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/curriculum', label: 'Currículo' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const headRef = useRef(null)
  const toggleRef = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const onPointerDown = (e) => {
      if (headRef.current && !headRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  useEffect(() => {
    document.body.classList.toggle('nav-open', open)
    return () => document.body.classList.remove('nav-open')
  }, [open])

  return (
    <header className="site-head" ref={headRef}>
      <div className="bar">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          QVAC <b>Masterclass</b>
        </Link>

        <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`} aria-label="Principal">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
            >
              {({ isActive }) => (
                <>
                  {label}
                  {isActive && !reduceMotion && (
                    <motion.span
                      layoutId="site-nav-indicator"
                      className="site-nav__indicator"
                      aria-hidden="true"
                      transition={{ type: 'spring', stiffness: 480, damping: 40 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <div className="site-nav__tools" aria-label="Preferencias">
            <UiModeToggle />
            <ThemeToggle />
          </div>
        </nav>

        <div className="head-actions" aria-hidden={open}>
          <UiModeToggle />
          <ThemeToggle />
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
          ref={toggleRef}
        >
          <span className="sr-only">{open ? 'Cerrar menú' : 'Abrir menú'}</span>
          <span aria-hidden="true" className={`nav-toggle__icon${open ? ' is-open' : ''}`} />
        </button>
      </div>
    </header>
  )
}
