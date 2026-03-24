import { useState, useEffect, useCallback } from 'react'
import type { ControlsConfig } from '../types/game.types'
import { displayKey, FORBIDDEN_KEYS, DEFAULT_CONTROLS } from '../utils/controls'

type Binding = { player: 1 | 2; action: 'up' | 'down' }

type ControlsModalProps = {
    controls: ControlsConfig
    onChange: (config: ControlsConfig) => void
    onClose: () => void
}

export function ControlsModal({ controls, onChange, onClose }: ControlsModalProps) {
    const [listening, setListening] = useState<Binding | null>(null)
    const [conflict, setConflict] = useState<string | null>(null)

    // Écoute la prochaine touche pressée
    const startListening = useCallback((binding: Binding) => {
        setConflict(null)
        setListening(binding)
    }, [])

    useEffect(() => {
        if (!listening) return

        const onKey = (e: KeyboardEvent) => {
            e.preventDefault()
            e.stopPropagation()

            const key = e.key

            // Touche interdite
            if (FORBIDDEN_KEYS.has(key)) {
                setConflict(`"${displayKey(key)}" est réservée`)
                setListening(null)
                return
            }

            // Vérifier conflit avec les autres touches
            const allKeys = [
                controls.player1.up,
                controls.player1.down,
                controls.player2.up,
                controls.player2.down,
            ]
            const currentKey = listening.player === 1
                ? controls[`player${listening.player}` as 'player1' | 'player2'][listening.action]
                : controls[`player${listening.player}` as 'player1' | 'player2'][listening.action]

            const duplicateIndex = allKeys.findIndex(k => k === key)
            const isSelf = key === currentKey

            if (!isSelf && duplicateIndex !== -1) {
                setConflict(`"${displayKey(key)}" est déjà utilisée`)
                setListening(null)
                return
            }

            // Appliquer le changement
            const updated: ControlsConfig = {
                ...controls,
                [`player${listening.player}`]: {
                    ...controls[`player${listening.player}` as 'player1' | 'player2'],
                    [listening.action]: key,
                },
            }
            onChange(updated)
            setListening(null)
            setConflict(null)
        }

        window.addEventListener('keydown', onKey, { capture: true })
        return () => window.removeEventListener('keydown', onKey, { capture: true })
    }, [listening, controls, onChange])

    const handleReset = () => {
        onChange({ ...DEFAULT_CONTROLS })
        setConflict(null)
    }

    return (
        <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)', borderRadius: '4px', zIndex: 20,
        }}>
            <div style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '28px 36px',
                minWidth: '340px',
                display: 'flex', flexDirection: 'column', gap: '20px',
            }}>
                {/* Titre */}
                <h2 style={{
                    color: '#fff', fontFamily: 'monospace',
                    fontSize: '14px', letterSpacing: '4px',
                    margin: 0, textAlign: 'center',
                }}>
                    CONTRÔLES
                </h2>

                {/* Joueur 1 */}
                <PlayerSection
                    label="Joueur 1"
                    upKey={controls.player1.up}
                    downKey={controls.player1.down}
                    listeningUp={listening?.player === 1 && listening.action === 'up'}
                    listeningDown={listening?.player === 1 && listening.action === 'down'}
                    onBindUp={() => startListening({ player: 1, action: 'up' })}
                    onBindDown={() => startListening({ player: 1, action: 'down' })}
                />

                <Divider />

                {/* Joueur 2 */}
                <PlayerSection
                    label="Joueur 2"
                    upKey={controls.player2.up}
                    downKey={controls.player2.down}
                    listeningUp={listening?.player === 2 && listening.action === 'up'}
                    listeningDown={listening?.player === 2 && listening.action === 'down'}
                    onBindUp={() => startListening({ player: 2, action: 'up' })}
                    onBindDown={() => startListening({ player: 2, action: 'down' })}
                />

                {/* Message d'écoute / conflit */}
                <div style={{ minHeight: '18px', textAlign: 'center' }}>
                    {listening && (
                        <span style={{ color: '#facc15', fontFamily: 'monospace', fontSize: '12px' }}>
                            Appuie sur une touche...
                        </span>
                    )}
                    {conflict && !listening && (
                        <span style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '12px' }}>
                            {conflict}
                        </span>
                    )}
                </div>

                <Divider />

                {/* Boutons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleReset} style={secondaryBtnStyle}>
                        Réinitialiser
                    </button>
                    <button onClick={onClose} style={primaryBtnStyle}>
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

type PlayerSectionProps = {
    label: string
    upKey: string
    downKey: string
    listeningUp: boolean
    listeningDown: boolean
    onBindUp: () => void
    onBindDown: () => void
}

function PlayerSection({
    label, upKey, downKey,
    listeningUp, listeningDown,
    onBindUp, onBindDown,
}: PlayerSectionProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'monospace', fontSize: '11px', letterSpacing: '2px',
            }}>
                {label.toUpperCase()}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
                <KeyBind label="Monter" keyName={upKey} listening={listeningUp} onClick={onBindUp} />
                <KeyBind label="Descendre" keyName={downKey} listening={listeningDown} onClick={onBindDown} />
            </div>
        </div>
    )
}

function KeyBind({ label, keyName, listening, onClick }: {
    label: string
    keyName: string
    listening: boolean
    onClick: () => void
}) {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{
                color: 'rgba(255,255,255,0.3)',
                fontFamily: 'monospace', fontSize: '10px',
            }}>
                {label}
            </span>
            <button onClick={onClick} style={{
                padding: '8px 12px',
                background: listening ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${listening ? '#facc15' : 'rgba(255,255,255,0.15)'}`,
                borderRadius: '6px',
                color: listening ? '#facc15' : '#ffffff',
                fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold',
                cursor: 'pointer', letterSpacing: '1px',
                transition: 'all 0.15s',
                minWidth: '80px',
            }}>
                {listening ? '...' : displayKey(keyName)}
            </button>
        </div>
    )
}

function Divider() {
    return <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
}

const primaryBtnStyle: React.CSSProperties = {
    flex: 1, padding: '10px',
    background: '#fff', color: '#0a0a0a',
    border: 'none', borderRadius: '6px',
    fontFamily: 'monospace', fontSize: '13px',
    fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer',
}

const secondaryBtnStyle: React.CSSProperties = {
    flex: 1, padding: '10px',
    background: 'transparent', color: 'rgba(255,255,255,0.4)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px',
    fontFamily: 'monospace', fontSize: '13px', cursor: 'pointer',
}