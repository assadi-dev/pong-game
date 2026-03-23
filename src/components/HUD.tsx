import type { GameState } from '../types/game.types'
import { CANVAS_WIDTH } from '../utils/constants'

type HUDProps = {
    state: GameState
    onPause: () => void
}

export function HUD({ state, onPause }: HUDProps) {
    const { paddleLeft, paddleRight, phase } = state

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            fontFamily: 'monospace',
        }}>
            {/* Scores */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: '80px',
                alignItems: 'center',
            }}>
                <ScoreDigit value={paddleLeft.score} highlight={phase === 'scored'} />
                <ScoreDigit value={paddleRight.score} highlight={phase === 'scored'} />
            </div>

            {/* Bouton pause */}
            <button
                onClick={onPause}
                style={{
                    position: 'absolute',
                    top: '12px',
                    right: '14px',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.25)',
                    fontSize: '18px',
                    cursor: 'pointer',
                    pointerEvents: 'all',
                    lineHeight: 1,
                    padding: '4px 6px',
                }}
                title="Pause (Echap)"
            >
                ⏸
            </button>

            {/* Indicateur de phase */}
            {phase === 'scored' && (
                <div style={{
                    position: 'absolute',
                    bottom: '18px',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    color: 'rgba(255,255,255,0.35)',
                    fontSize: '12px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                }}>
                    Point !
                </div>
            )}
        </div>
    )
}

// ─── Score avec animation pulse ───────────────────────────────────────────────

function ScoreDigit({ value, highlight }: { value: number; highlight: boolean }) {
    return (
        <span style={{
            fontSize: '52px',
            fontWeight: 'bold',
            color: highlight ? '#ffffff' : 'rgba(255,255,255,0.55)',
            transition: 'color 0.2s ease, transform 0.2s ease',
            display: 'inline-block',
            transform: highlight ? 'scale(1.15)' : 'scale(1)',
            textShadow: highlight ? '0 0 20px rgba(255,255,255,0.5)' : 'none',
            minWidth: '40px',
            textAlign: 'center',
        }}>
            {value}
        </span>
    )
}