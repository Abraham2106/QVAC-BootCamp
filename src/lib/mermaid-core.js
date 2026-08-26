export function getResolvedTheme() {
  const attr = document.documentElement.dataset.theme
  if (attr === 'dark' || attr === 'light') return attr
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function getMermaidConfig() {
  const dark = getResolvedTheme() === 'dark'

  return {
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: dark
      ? {
          darkMode: true,
          background: '#111111',
          primaryColor: '#141414',
          primaryTextColor: '#fafafa',
          primaryBorderColor: '#404040',
          secondaryColor: '#141414',
          tertiaryColor: '#0a0a0a',
          lineColor: '#a3a3a3',
          textColor: '#fafafa',
          mainBkg: '#141414',
          nodeBorder: '#404040',
          clusterBkg: '#141414',
          titleColor: '#fafafa',
          edgeLabelBackground: '#111111',
          fontFamily: 'Fira Sans, system-ui, sans-serif',
        }
      : {
          darkMode: false,
          background: '#ffffff',
          primaryColor: '#f6f6f6',
          primaryTextColor: '#171717',
          primaryBorderColor: '#d4d4d4',
          secondaryColor: '#fafafa',
          tertiaryColor: '#ffffff',
          lineColor: '#525252',
          textColor: '#171717',
          mainBkg: '#f6f6f6',
          nodeBorder: '#d4d4d4',
          clusterBkg: '#fafafa',
          titleColor: '#171717',
          edgeLabelBackground: '#ffffff',
          fontFamily: 'Fira Sans, system-ui, sans-serif',
        },
  }
}

export function prepareMermaidNodes(root = document) {
  const nodes = root.querySelectorAll('pre.mermaid, .mermaid[data-mermaid]')
  nodes.forEach((node, index) => {
    if (!node.dataset.mermaidSource) {
      node.dataset.mermaidSource = node.textContent.trim()
    }
    if (!node.id) node.id = `mermaid-${index}`
    if (node.querySelector('svg')) {
      node.textContent = node.dataset.mermaidSource
      node.removeAttribute('data-processed')
    }
  })
  return nodes
}
