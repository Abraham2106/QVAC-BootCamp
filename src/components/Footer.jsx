export default function Footer({ extra }) {
  return (
    <footer className="site-foot">
      <div className="inner">
        <span>The Local-First AI Systems Masterclass · QVAC SDK v0.18.x / v0.18.1</span>
        <span className="site-foot__links">
          {extra}
          <a href="https://docs.qvac.tether.io/" target="_blank" rel="noopener noreferrer">
            docs.qvac.tether.io
          </a>
          {' · '}
          <a href="https://www.npmjs.com/package/@qvac/sdk" target="_blank" rel="noopener noreferrer">
            @qvac/sdk
          </a>
        </span>
      </div>
    </footer>
  )
}
