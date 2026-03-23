import { useRef, useEffect, useState } from 'react'
import { useGameState } from '../hooks/useGameState'
import { useMusic } from '../hooks/useMusic'
import { drawScene, resetTrail } from '../renderer/drawScene'
import { HUD } from './HUD'
import { MenuScreen } from './MenuScreen'
import { SettingsModal } from './SettingsModal'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants'

export function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { state, start, pause, reset, setMode } = useGameState()
    const music = useMusic()
    const [showSettings, setShowSettings] = useState(false)
    const prevPhaseRef = useRef(state.phase)

    // ── Rendu Canvas ────────────────────────────────────────────────────────────
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return
        if (state.phase === 'menu' || state.phase === 'gameover') return
        drawScene(ctx, state)
    }, [state])

    // Reset traînée entre les points
    useEffect(() => {
        if (state.phase === 'playing') resetTrail()
    }, [state.phase])

    // ── Réactions musique aux transitions de phase ──────────────────────────────
    useEffect(() => {
        const prev = prevPhaseRef.current
        const curr = state.phase

        // Démarrer la musique dès que le jeu commence
        if (prev === 'menu' && curr === 'playing') {
            music.play()
            music.fadeIn(600)
        }

        // Pause → baisser la musique
        if (curr === 'paused' && prev === 'playing') {
            music.fadeOut(400)
        }
        if (curr === 'playing' && prev === 'paused') {
            music.fadeIn(400)
        }

        // Game over → fade out long
        if (curr === 'gameover' && prev !== 'gameover') {
            music.fadeOut(1800)
        }

        prevPhaseRef.current = curr
    }, [state.phase, music])

    // ── Pause automatique quand settings ouvert ────────────────────────────────
    useEffect(() => {
        if (showSettings && state.phase === 'playing') pause()
    }, [showSettings]) // eslint-disable-line react-hooks/exhaustive-deps

    // ── Echap → ferme settings ou met en pause ──────────────────────────────────
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
        <div style={{ textAlign: 'center', userSelect: 'none' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>

                {/* Canvas de jeu */}
                <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    style={{
                        display: 'block',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '4px',
                        background: '#0a0a0a',
                    }}
                />

                {/* HUD superposé */}
                {(state.phase === 'playing' || state.phase === 'scored') && (
                    <HUD
                        state={state}
                        onPause={pause}
                        musicMuted={music.muted}
                        onMusicMute={music.toggleMute}
                        onSettings={() => setShowSettings(true)}
                    />
                )}

                {/* Modal paramètres — visible par-dessus tout */}
                {showSettings && (
                    <SettingsModal
                        musicVolume={music.volume}
                        musicMuted={music.muted}
                        onMusicVolume={music.setVolume}
                        onMusicMute={music.toggleMute}
                        onClose={() => setShowSettings(false)}
                    />
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
                        <PrimaryButton onClick={() => { setShowSettings(false); pause() }}>
                            Reprendre
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setShowSettings(true)}>
                            ⚙ Paramètres
                        </SecondaryButton>
                        <SecondaryButton onClick={() => { reset(); music.fadeOut(400) }}>
                            Quitter
                        </SecondaryButton>
                    </Overlay>
                )}

                {/* Overlay Game Over */}
                {state.phase === 'gameover' && (
                    <Overlay>
                        <BigTitle>
                            {state.winner === 'left' ? 'Joueur 1' : 'Joueur 2'} gagne !
                        </BigTitle>
                        <FinalScore>
                            {state.paddleLeft.score} — {state.paddleRight.score}
                        </FinalScore>
                        <PrimaryButton onClick={() => { start(state.gameMode, state.difficulty); music.fadeIn(600) }}>
                            Rejouer
                        </PrimaryButton>
                        <SecondaryButton onClick={reset}>Menu</SecondaryButton>
                    </Overlay>
                )}
            </div>

            <p style={{
                color: 'rgba(255,255,255,0.15)',
                fontFamily: 'monospace', fontSize: '11px', marginTop: '10px',
            }}>
                Echap pour pause
            </p>
        </div>
    )
}

// ─── Composants UI ────────────────────────────────────────────────────────────

function Overlay({ children }: { children: React.ReactNode }) {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '14px',
            background: 'rgba(10,10,10,0.88)',
            borderRadius: '4px',
        }}>
            {children}
        </div>
    )
}

function BigTitle({ children }: { children: React.ReactNode }) {
    return (
        <h1 style={{
            color: '#fff', fontFamily: 'monospace',
            fontSize: '52px', margin: '0 0 8px',
            letterSpacing: '8px', fontWeight: 'bold',
        }}>
            {children}
        </h1>
    )
}

function FinalScore({ children }: { children: React.ReactNode }) {
    return (
        <p style={{
            color: 'rgba(255,255,255,0.55)',
            fontFamily: 'monospace', fontSize: '36px', margin: 0,
        }}>
            {children}
        </p>
    )
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            marginTop: '8px', padding: '10px 36px',
            background: '#ffffff', color: '#0a0a0a',
            border: 'none', borderRadius: '4px',
            fontFamily: 'monospace', fontSize: '15px', fontWeight: 'bold',
            cursor: 'pointer', letterSpacing: '3px',
        }}>
            {children}
        </button>
    )
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <button onClick={onClick} style={{
            padding: '8px 24px',
            background: 'transparent', color: 'rgba(255,255,255,0.35)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
            fontFamily: 'monospace', fontSize: '13px',
            cursor: 'pointer',
        }}>
            {children}
        </button>
    )
}