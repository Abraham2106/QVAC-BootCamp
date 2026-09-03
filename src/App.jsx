import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DocsLayout from './layouts/DocsLayout'
import Home from './pages/Home'
import Curriculum from './pages/Curriculum'
import Class01 from './pages/Class01'
import Class02 from './pages/Class02'
import Class03 from './pages/Class03'
import Class04 from './pages/Class04'
import Class05 from './pages/Class05'
import Class06 from './pages/Class06'
import Class07 from './pages/Class07'
import Class08 from './pages/Class08'
import Class09 from './pages/Class09'
import Class10 from './pages/Class10'
import MarkdownPage from './pages/MarkdownPage'
import NotFound from './pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<DocsLayout />}>
        <Route index element={<Home />} />
        <Route path="curriculum" element={<Curriculum />} />
        <Route path="class/01" element={<Class01 />} />
        <Route path="class/02" element={<Class02 />} />
        <Route path="class/03" element={<Class03 />} />
        <Route path="class/04" element={<Class04 />} />
        <Route path="class/05" element={<Class05 />} />
        <Route path="class/06" element={<Class06 />} />
        <Route path="class/07" element={<Class07 />} />
        <Route path="class/08" element={<Class08 />} />
        <Route path="class/09" element={<Class09 />} />
        <Route path="class/10" element={<Class10 />} />
        <Route path="markdown/*" element={<MarkdownPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  useEffect(() => {
    const replacements = [
      [/Break It · Measure It/gi, 'Diagnóstico · evidencia'],
      [/Break It\/Measure It/gi, 'Diagnóstico y medición'],
      [/Break It/gi, 'Diagnóstico'],
      [/Measure It/gi, 'Medición'],
    ]
    const normalize = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        replacements.forEach(([pattern, replacement]) => { node.nodeValue = node.nodeValue.replace(pattern, replacement) })
      } else if (node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', 'STYLE'].includes(node.tagName)) {
        node.childNodes.forEach(normalize)
      }
    }
    normalize(document.body)
    const observer = new MutationObserver((mutations) => mutations.forEach(({ addedNodes }) => addedNodes.forEach(normalize)))
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
