/**
 * A quiet map of local devices: a few nodes share a route, with the center
 * node acting as the local inference point. It gives the hero a visual idea
 * to hold onto without competing with the copy or becoming a tech texture.
 */
export default function HeroMesh() {
  return (
    <div className="hero-mesh" aria-hidden="true">
      <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
        <g className="hero-mesh__routes" fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M64 92 C190 92 218 184 350 184 S556 92 736 92" />
          <path d="M64 308 C190 308 218 216 350 216 S556 308 736 308" />
          <path d="M350 184 C389 160 414 126 446 90" />
          <path d="M350 216 C389 240 414 274 446 310" />
        </g>
        <g className="hero-mesh__signals" fill="currentColor">
          <circle cx="64" cy="92" r="4" />
          <circle cx="64" cy="308" r="4" />
          <circle cx="736" cy="92" r="4" />
          <circle cx="736" cy="308" r="4" />
        </g>
        <g className="hero-mesh__core">
          <circle cx="350" cy="200" r="34" fill="var(--bg-subtle)" stroke="currentColor" />
          <circle cx="350" cy="200" r="7" fill="currentColor" />
          <path d="M350 176v48M326 200h48" stroke="currentColor" strokeWidth="1" />
        </g>
        <g className="hero-mesh__satellites" fill="var(--bg-subtle)" stroke="currentColor">
          <rect x="426" y="70" width="40" height="40" rx="8" />
          <rect x="426" y="290" width="40" height="40" rx="8" />
          <path d="M438 90h16M438 310h16" stroke="currentColor" strokeWidth="2" />
        </g>
      </svg>
    </div>
  )
}
