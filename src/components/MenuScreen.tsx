import { useState } from 'react'
import type { GameMode, Difficulty } from '../types/game.types'


type MenuScreenProps = {
    onStart: (mode: GameMode, difficulty: Difficulty) => void
}

export function MenuScreen({ onStart }: MenuScreenProps) {
    const [mode, setMode] = useState<GameMode>('pvp')
    const [difficulty, setDifficulty] = useState<Difficulty>('medium')

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: '28px', padding: '40px 0',
        }}>
            {/* Titre */}
            <h1 style={{
                color: '#fff', fontFamily: 'monospace',
                fontSize: '64px', letterSpacing: '12px',
                margin: 0, fontWeight: 'bold',
                textShadow: '0 0 30px rgba(255,255,255,0.2)',
            }}>
                PONG
            </h1>

            {/* Mode de jeu */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Label>Mode</Label>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <ModeButton active={mode === 'pvp'} onClick={() => setMode('pvp')}>
                        👥 2 Joueurs
                    </ModeButton>
                    <ModeButton active={mode === 'solo'} onClick={() => setMode('solo')}>
                        🤖 Solo vs IA
                    </ModeButton>
                </div>
            </div>

            {/* Difficulté (visible seulement en mode solo) */}
            {mode === 'solo' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <Label>Difficulté</Label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <DiffButton active={difficulty === 'easy'} onClick={() => setDifficulty('easy')}>
                            Facile
                        </DiffButton>
                        <DiffButton active={difficulty === 'medium'} onClick={() => setDifficulty('medium')}>
                            Moyen
                        </DiffButton>
                        <DiffButton active={difficulty === 'hard'} onClick={() => setDifficulty('hard')}>
                            Difficile
                        </DiffButton>
                    </div>
                </div>
            )}

            {/* Contrôles */}
            <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '6px',
                padding: '16px 28px',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
            }}>
                <Label>Contrôles</Label>
                <ControlHint left="Joueur 1" right="W / S" />
                {mode === 'pvp'
                    ? <ControlHint left="Joueur 2" right="↑ / ↓" />
                    : <ControlHint left="Joueur 2" right="IA 🤖" />
                }
                <ControlHint left="Pause" right="Echap" />
            </div>

            {/* Bouton Jouer */}
            <button
                onClick={() => onStart(mode, difficulty)}
                style={{
                    padding: '14px 52px',
                    background: '#ffffff', color: '#0a0a0a',
                    border: 'none', borderRadius: '6px',
                    fontFamily: 'monospace', fontSize: '18px',
                    fontWeight: 'bold', letterSpacing: '4px',
                    cursor: 'pointer',
                    transition: 'transform 0.1s, opacity 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
                JOUER
            </button>
        </div>
    )
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <span style={{
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'monospace', fontSize: '11px',
            letterSpacing: '3px', textTransform: 'uppercase',
        }}>
            {children}
        </span>
    )
}

function ModeButton({ children, active, onClick }: {
    children: React.ReactNode
    active: boolean
    onClick: () => void
}) {
    return (
        <button onClick={onClick} style={{
            padding: '10px 22px',
            background: active ? '#ffffff' : 'transparent',
            color: active ? '#0a0a0a' : 'rgba(255,255,255,0.5)',
            border: active ? 'none' : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '6px',
            fontFamily: 'monospace', fontSize: '13px',
            cursor: 'pointer', transition: 'all 0.15s',
        }}>
            {children}
        </button>
    )
}

function DiffButton({ children, active, onClick }: {
    children: React.ReactNode
    active: boolean
    onClick: () => void
}) {
    const colors: Record<string, string> = {
        Facile: '#4ade80', Moyen: '#facc15', Difficile: '#f87171',
    }
    const col = colors[children as string] ?? '#fff'

    return (
        <button onClick={onClick} style={{
            padding: '8px 18px',
            background: active ? col : 'transparent',
            color: active ? '#0a0a0a' : 'rgba(255,255,255,0.45)',
            border: active ? 'none' : '1px solid rgba(255,255,255,0.15)',
            borderRadius: '6px',
            fontFamily: 'monospace', fontSize: '12px',
            cursor: 'pointer', transition: 'all 0.15s',
            fontWeight: active ? 'bold' : 'normal',
        }}>
            {children}
        </button>
    )
}

function ControlHint({ left, right }: { left: string; right: string }) {
    return (
        <div style={{
            display: 'flex', gap: '24px',
            justifyContent: 'space-between', width: '200px',
        }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', fontSize: '12px' }}>
                {left}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', fontSize: '12px' }}>
                {right}
            </span>
        </div>
    )
}