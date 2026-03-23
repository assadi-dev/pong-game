type SettingsModalProps = {
    musicVolume: number
    musicMuted: boolean
    onMusicVolume: (v: number) => void
    onMusicMute: () => void
    onClose: () => void
}

export function SettingsModal({
    musicVolume,
    musicMuted,
    onMusicVolume,
    onMusicMute,
    onClose,
}: SettingsModalProps) {
    return (
        <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.75)',
            borderRadius: '4px',
            zIndex: 10,
        }}>
            <div style={{
                background: '#161616',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '32px 40px',
                minWidth: '320px',
                display: 'flex', flexDirection: 'column', gap: '24px',
            }}>
                {/* Titre */}
                <h2 style={{
                    color: '#fff', fontFamily: 'monospace',
                    fontSize: '16px', letterSpacing: '4px',
                    margin: 0, textAlign: 'center',
                }}>
                    PARAMÈTRES
                </h2>

                {/* Volume musique */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Label>Musique</Label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Pct value={musicMuted ? 0 : musicVolume} />
                            <MuteButton muted={musicMuted} onClick={onMusicMute} />
                        </div>
                    </div>
                    <input
                        type="range" min={0} max={100}
                        value={Math.round(musicMuted ? 0 : musicVolume * 100)}
                        onChange={e => {
                            if (musicMuted) onMusicMute() // unmute si on bouge le slider
                            onMusicVolume(Number(e.target.value) / 100)
                        }}
                        style={sliderStyle}
                    />
                </div>

                <Divider />

                {/* Fermer */}
                <button onClick={onClose} style={{
                    padding: '10px',
                    background: '#fff', color: '#0a0a0a',
                    border: 'none', borderRadius: '6px',
                    fontFamily: 'monospace', fontSize: '13px',
                    fontWeight: 'bold', letterSpacing: '3px',
                    cursor: 'pointer',
                }}>
                    FERMER
                </button>
            </div>
        </div>
    )
}

// ─── Sous-composants ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
    return (
        <span style={{
            color: 'rgba(255,255,255,0.5)',
            fontFamily: 'monospace', fontSize: '12px', letterSpacing: '2px',
        }}>
            {children}
        </span>
    )
}

function Pct({ value }: { value: number }) {
    return (
        <span style={{
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'monospace', fontSize: '11px', minWidth: '36px', textAlign: 'right',
        }}>
            {Math.round(value * 100)}%
        </span>
    )
}

function MuteButton({ muted, onClick }: { muted: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} title={muted ? 'Activer' : 'Couper'} style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px',
            color: muted ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.7)',
            fontFamily: 'monospace', fontSize: '14px',
            cursor: 'pointer', padding: '2px 6px',
            lineHeight: 1,
        }}>
            {muted ? '🔇' : '🔊'}
        </button>
    )
}

function Divider() {
    return <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
}

const sliderStyle: React.CSSProperties = {
    width: '100%',
    accentColor: '#ffffff',
    cursor: 'pointer',
}