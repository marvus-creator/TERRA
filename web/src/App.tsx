import { Route, Routes } from 'react-router-dom'
import AppShell from './components/shell/AppShell'
import Home from './pages/Home'
import Farms from './pages/Farms'
import FarmDetail from './pages/FarmDetail'
import Register from './pages/Register'
import Watching from './pages/Watching'
import MapPage from './pages/MapPage'
import Lender from './pages/Lender'
import HowItWorks from './pages/HowItWorks'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/farms" element={<Farms />} />
        <Route path="/farms/:farmId" element={<FarmDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register/watching/:farmId" element={<Watching />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/lenders" element={<Lender />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  )
}
