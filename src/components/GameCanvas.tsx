import { useRef, useEffect } from 'react'
import { useGameState } from '../hooks/useGameState'
import { drawScene, resetTrail } from '../renderer/drawScene'
import { HUD } from './HUD'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants'

export function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { state, start, pause, reset } = useGameState()

    // Rendu Canvas à chaque changement d'état
    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d')
        if (!ctx) return
        if (state.phase === 'menu' || state.phase === 'gameover') return
        drawScene(ctx, state)
    }, [state])

    // Reset traînée balle entre les points
    useEffect(() => {
        if (state.phase === 'playing') resetTrail()
    }, [state.phase])

    // Echap → pause
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') pause()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [pause])

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

                {/* HUD superposé (score + pause) */}
                {(state.phase === 'playing' || state.phase === 'scored') && (
                    <HUD state={state} onPause={pause} />
                )}

                {/* Overlay Menu */}
                {state.phase === 'menu' && (
                    <Overlay>
                        <BigTitle>PONG</BigTitle>
                        <Hint>Joueur 1 : W / S</Hint>
                        <Hint>Joueur 2 : ↑ / ↓</Hint>
                        <PrimaryButton onClick={start}>Jouer</PrimaryButton>
                    </Overlay>
                )}

                {/* Overlay Pause */}
                {state.phase === 'paused' && (
                    <Overlay>
                        <BigTitle>PAUSE</BigTitle>
                        <PrimaryButton onClick={pause}>Reprendre</PrimaryButton>
                        <SecondaryButton onClick={reset}>Quitter</SecondaryButton>
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
                        <PrimaryButton onClick={start}>Rejouer</PrimaryButton>
                        <SecondaryButton onClick={reset}>Menu</SecondaryButton>
                    </Overlay>
                )}
            </div>

            <p style={{
                color: 'rgba(255,255,255,0.18)',
                fontFamily: 'monospace',
                fontSize: '11px',
                marginTop: '10px',
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
            background: 'rgba(10,10,10,0.85)',
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

function Hint({ children }: { children: React.ReactNode }) {
    return (
        <p style={{
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'monospace', fontSize: '13px', margin: 0,
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