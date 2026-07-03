import { Route, Routes } from 'react-router-dom'
import ClickSpark from './components/reactbits/ClickSpark'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Farms from './pages/Farms'
import FarmDetail from './pages/FarmDetail'
import Register from './pages/Register'
import MapPage from './pages/MapPage'
import HowItWorks from './pages/HowItWorks'

export default function App() {
  return (
    <ClickSpark sparkColor="#4ade80" sparkRadius={22} sparkCount={8} duration={450}>
      <div className="flex min-h-screen flex-col">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/farms" element={<Farms />} />
            <Route path="/farms/:farmId" element={<FarmDetail />} />
            <Route path="/register" element={<Register />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Routes>
        </main>
        <footer className="border-t border-white/5 py-8 text-center text-xs text-emerald-100/30">
          TERRA · satellite credit intelligence · built in Rwanda 🇷🇼 · imagery: ESA Sentinel-2 via AWS Open Data
        </footer>
      </div>
    </ClickSpark>
  )
}
