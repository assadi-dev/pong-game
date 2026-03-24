import { useState } from 'react'
import type Phaser from 'phaser'
import { PhaserContainer } from './components/PhaserContainer'
import { GameCanvas } from './components/GameCanvas'

/**
 * Phase 1 : les deux modes cohabitent — on peut basculer entre
 * l'ancienne version React/Canvas et la nouvelle Phaser via un flag.
 * En Phase 2+ on supprimera GameCanvas et le toggle.
 */
const USE_PHASER = true

export default function App() {
  const [scene, setScene] = useState<Phaser.Scene | null>(null)
  void scene // sera utilisé en Phase 6 pour le pont EventBus

  if (!USE_PHASER) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', background: '#0a0a0a',
      }}>
        <GameCanvas />
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#0a0a0a',
    }}>
      <div style={{ position: 'relative' }}>
        <PhaserContainer onSceneReady={setScene} />
        {/* Overlays React superposés en Phase 6 */}
      </div>
      <p style={{
        color: 'rgba(255,255,255,0.18)',
        fontFamily: 'monospace', fontSize: '11px', marginTop: '10px',
      }}>
        Phase 1 — Phaser + React cohabitent
      </p>
    </div>
  )
}