import { Route, Routes } from 'react-router-dom'
import CreateAlbum from './pages/CreateAlbum.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import Pricing from './pages/Pricing.jsx'
import PublicAlbum from './pages/PublicAlbum.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateAlbum />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/view/:slug" element={<PublicAlbum />} />
    </Routes>
  )
}

export default App
