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
    }}>
      <GameCanvas />
    </div>
  )
}

export default App