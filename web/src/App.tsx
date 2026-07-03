import ClickSpark from './components/reactbits/ClickSpark'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <ClickSpark sparkColor="#4ade80" sparkRadius={22} sparkCount={8} duration={450}>
      <Hero />
      <Dashboard />
      <footer className="border-t border-white/5 py-8 text-center text-xs text-emerald-100/30">
        TERRA · satellite credit intelligence · built in Rwanda 🇷🇼
      </footer>
    </ClickSpark>
  )
}
