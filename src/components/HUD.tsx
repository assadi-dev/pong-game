import type { GameState } from '../types/game.types'


type HUDProps = {
    state: GameState
    onPause: () => void
    musicMuted: boolean
    onMusicMute: () => void
    onSettings: () => void
}

export function HUD({ state, onPause, musicMuted, onMusicMute, onSettings }: HUDProps) {
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
            {/* Boutons top-right */}
            <div style={{
                position: 'absolute', top: '10px', right: '10px',
                display: 'flex', gap: '4px', pointerEvents: 'all',
            }}>
                <IconBtn onClick={onMusicMute} title={musicMuted ? 'Activer musique' : 'Couper musique'}>
                    {musicMuted ? '🔇' : '🔊'}
                </IconBtn>
                <IconBtn onClick={onSettings} title="Paramètres">⚙</IconBtn>
                <IconBtn onClick={onPause} title="Pause (Echap)">⏸</IconBtn>
            </div>

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

// ─── Bouton icône ────────────────────────────────────────────────────────────

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title?: string }) {
    return (
        <button onClick={onClick} title={title} style={{
            background: 'transparent', border: 'none',
            color: 'rgba(255,255,255,0.3)', fontSize: '16px',
            cursor: 'pointer', lineHeight: 1, padding: '4px 5px',
        }}>
            {children}
        </button>
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