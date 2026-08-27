import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DocsLayout from './layouts/DocsLayout'
import Home from './pages/Home'
import Curriculum from './pages/Curriculum'
import Class01 from './pages/Class01'
import Class02 from './pages/Class02'
import Class03 from './pages/Class03'
import Class04 from './pages/Class04'
import Class05 from './pages/Class05'
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
