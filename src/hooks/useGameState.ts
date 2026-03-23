import { useReducer, useCallback, useRef } from 'react'
import { gameReducer } from '../utils/gameReducer'
import { createInitialState } from '../utils/factories'
import { useGameLoop } from './useGameLoop'
import { useKeyboard } from './useKeyboard'
import type { GameState, GameAction } from '../types/game.types'

const SCORED_FREEZE_DURATION = 1.0

export function useGameState() {
    const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
    const keysRef = useKeyboard()
    const scoredTimerRef = useRef(0)

    const tick = useCallback((dt: number) => {
        // Pendant le freeze post-point, on attend avant de relancer
        if (state.phase === 'scored') {
            scoredTimerRef.current += dt
            if (scoredTimerRef.current >= SCORED_FREEZE_DURATION) {
                scoredTimerRef.current = 0
                dispatch({ type: 'RESUME_AFTER_POINT' })
            }
            return
        }

        dispatch({ type: 'TICK', deltaTime: dt, keys: keysRef.current })
    }, [state.phase, keysRef])

    const running = state.phase === 'playing' || state.phase === 'scored'

    useGameLoop(tick, running)

    const start = useCallback(() => dispatch({ type: 'START_GAME' }), [])
    const pause = useCallback(() => dispatch({ type: 'PAUSE_TOGGLE' }), [])
    const reset = useCallback(() => dispatch({ type: 'RESET_GAME' }), [])

    return { state, start, pause, reset, dispatch } as {
        state: GameState
        start: () => void
        pause: () => void
        reset: () => void
        dispatch: React.Dispatch<GameAction>
    }
}