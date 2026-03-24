import { useState, useEffect, useCallback } from 'react'
import { EventBus } from '../game/EventBus'
import type { SceneState } from '../game/scenes/GameScene'
import type { GameMode, Difficulty } from '../types/game.types'

const initialState: SceneState = {
  phase: 'menu',
  scoreLeft: 0,
  scoreRight: 0,
  winner: null,
  gameMode: 'pvp',
  difficulty: 'medium',
}

/**
 * Pont React ↔ Phaser via EventBus.
 *
 * - Écoute les événements Phaser → met à jour le state React
 * - Expose des fonctions qui émettent des commandes vers Phaser
 */
export function usePhaserBridge() {
  const [state, setState] = useState<SceneState>(initialState)

  // Écoute les mises à jour d'état depuis la scène
  useEffect(() => {
    const onStateUpdate = (newState: SceneState) => {
      setState({ ...newState })
    }

    EventBus.on('state-update', onStateUpdate)
    return () => { EventBus.off('state-update', onStateUpdate) }
  }, [])

  // Commandes React → Phaser
  const start = useCallback((gameMode: GameMode, difficulty: Difficulty) => {
    EventBus.emit('cmd-start', { gameMode, difficulty })
  }, [])

  const pause = useCallback(() => {
    if (state.phase === 'playing') EventBus.emit('cmd-pause')
    else if (state.phase === 'paused') EventBus.emit('cmd-resume')
  }, [state.phase])

  const reset = useCallback(() => {
    EventBus.emit('cmd-reset')
  }, [])

  const setMode = useCallback((gameMode: GameMode, difficulty: Difficulty) => {
    EventBus.emit('cmd-set-mode', { gameMode, difficulty })
  }, [])

  return { state, start, pause, reset, setMode }
}