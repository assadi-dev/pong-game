import { usePhaserBridge } from './hooks/usePhaserBridge'
import { PhaserContainer } from './components/PhaserContainer'
import { HUD } from './components/HUD'
import { MenuScreen } from './components/MenuScreen'
import { SettingsModal } from './components/SettingsModal'
import { useMusic } from './hooks/useMusic'
import { useState, useEffect, useRef } from 'react'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './utils/constants'

export default function App() {
  const { state, start, pause, reset, setMode } = usePhaserBridge()
  const music = useMusic()
  const [showSettings, setShowSettings] = useState(false)
  const prevPhaseRef = useRef(state.phase)

  // Réactions musique aux transitions de phase
  useEffect(() => {
    const prev = prevPhaseRef.current
    const curr = state.phase
    if (prev === 'menu' && curr === 'playing') { music.play(); music.fadeIn(600) }
    if (curr === 'paused' && prev === 'playing') music.fadeOut(400)
    if (curr === 'playing' && prev === 'paused') music.fadeIn(400)
    if (curr === 'gameover' && prev !== 'gameover') music.fadeOut(1800)
    prevPhaseRef.current = curr
  }, [state.phase, music])

  // Pause auto quand settings ouvert
  useEffect(() => {
    if (showSettings && state.phase === 'playing') pause()
  }, [showSettings]) // eslint-disable-line react-hooks/exhaustive-deps

  // Echap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSettings) { setShowSettings(false); return }
        pause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pause, showSettings])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#0a0a0a',
    }}>
      <div style={{ position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>

        {/* Canvas Phaser */}
        <PhaserContainer />

        {/* HUD superposé */}
        {(state.phase === 'playing' || state.phase === 'scored') && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <HUD
              state={{
                phase: state.phase,
                paddleLeft: { position: { x: 0, y: 0 }, width: 0, height: 0, score: state.scoreLeft },
                paddleRight: { position: { x: 0, y: 0 }, width: 0, height: 0, score: state.scoreRight },
                ball: { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, size: 0 },
                winningScore: 7,
                winner: state.winner,
                gameMode: state.gameMode,
                difficulty: state.difficulty,
              }}
              onPause={pause}
              musicMuted={music.muted}
              onMusicMute={music.toggleMute}
              onSettings={() => setShowSettings(true)}
            />
          </div>
        )}

        {/* Modal paramètres */}
        {showSettings && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <SettingsModal
              musicVolume={music.volume}
              musicMuted={music.muted}
              onMusicVolume={music.setVolume}
              onMusicMute={music.toggleMute}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}

        {/* Overlay Menu */}
        {state.phase === 'menu' && (
          <Overlay>
            <MenuScreen
              musicMuted={music.muted}
              musicVolume={music.volume}
              onMusicMute={music.toggleMute}
              onMusicVolume={music.setVolume}
              onSettings={() => setShowSettings(true)}
              onStart={(mode, diff) => { music.init(); start(mode, diff) }}
            />
          </Overlay>
        )}

        {/* Overlay Pause */}
        {state.phase === 'paused' && !showSettings && (
          <Overlay>
            <BigTitle>PAUSE</BigTitle>
            <PrimaryButton onClick={pause}>Reprendre</PrimaryButton>
            <SecondaryButton onClick={() => setShowSettings(true)}>⚙ Paramètres</SecondaryButton>
            <SecondaryButton onClick={() => { reset(); music.fadeOut(400) }}>Quitter</SecondaryButton>
          </Overlay>
        )}

        {/* Overlay Game Over */}
        {state.phase === 'gameover' && (
          <Overlay>
            <BigTitle>{state.winner === 'left' ? 'Joueur 1' : 'Joueur 2'} gagne !</BigTitle>
            <FinalScore>{state.scoreLeft} — {state.scoreRight}</FinalScore>
            <PrimaryButton onClick={() => { start(state.gameMode, state.difficulty); music.fadeIn(600) }}>
              Rejouer
            </PrimaryButton>
            <SecondaryButton onClick={reset}>Menu</SecondaryButton>
          </Overlay>
        )}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'monospace', fontSize: '11px', marginTop: '10px' }}>
        Echap pour pause
      </p>
    </div>
  )
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '14px', background: 'rgba(10,10,10,0.88)',
      borderRadius: '4px',
    }}>
      {children}
    </div>
  )
}

function BigTitle({ children }: { children: React.ReactNode }) {
  return <h1 style={{ color: '#fff', fontFamily: 'monospace', fontSize: '52px', margin: '0 0 8px', letterSpacing: '8px' }}>{children}</h1>
}

function FinalScore({ children }: { children: React.ReactNode }) {
  return <p style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', fontSize: '36px', margin: 0 }}>{children}</p>
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      marginTop: '8px', padding: '10px 36px',
      background: '#ffffff', color: '#0a0a0a',
      border: 'none', borderRadius: '4px',
      fontFamily: 'monospace', fontSize: '15px', fontWeight: 'bold',
      cursor: 'pointer', letterSpacing: '3px',
    }}>{children}</button>
  )
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 24px',
      background: 'transparent', color: 'rgba(255,255,255,0.35)',
      border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
      fontFamily: 'monospace', fontSize: '13px', cursor: 'pointer',
    }}>{children}</button>
  )
}