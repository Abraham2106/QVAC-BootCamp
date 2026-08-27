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
import PublishedClass from './pages/PublishedClass'
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
        <Route path="class/08" element={<PublishedClass number={8} title="Translation and the Voice Relay" description="Un intérprete local en tiempo real: ASR, traducción y TTS con contratos y métricas." folder="class-08-translation-voice-relay" />} />
        <Route path="class/09" element={<PublishedClass number={9} title="The OpenAI-Compatible Escape Hatch" description="Migra un cliente hacia inferencia local sin rediseñar su interfaz." folder="class-09-openai-compatible-escape-hatch" />} />
        <Route path="class/10" element={<PublishedClass number={10} title="Designing Local-First Architectures" description="Define fronteras de datos, confianza y fallbacks defendibles." folder="class-10-local-first-architectures" />} />
        <Route path="markdown/*" element={<MarkdownPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
