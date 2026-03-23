import './App.css'
import { GameCanvas } from './components/GameCanvas'

function App() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#0a0a0a',
      gap: '16px',
    }}>
      <GameCanvas />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '12px' }}>
        Phase 2 — Canvas & boucle de jeu ✓
      </p>
    </div>)
}

export default App
