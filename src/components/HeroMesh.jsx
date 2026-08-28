/** Subtle grid background for the hero — flat docs aesthetic. */
export default function HeroMesh() {
  return (
    <div className="hero-mesh" aria-hidden="true">
      <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="mesh" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mesh)" />
      </svg>
    </div>
  )
}
