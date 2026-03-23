import { useReducer, useCallback, useRef, useEffect } from 'react'
import { gameReducer } from '../utils/gameReducer'
import { createInitialState } from '../utils/factories'
import { useGameLoop } from './useGameLoop'
import { useKeyboard } from './useKeyboard'
import { useAudio } from './useAudio'
import type { GameState, GameAction } from '../types/game.types'

const SCORED_FREEZE_DURATION = 1.0

export function useGameState() {
    const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
    const keysRef = useKeyboard()
    const scoredTimerRef = useRef(0)
    const prevStateRef = useRef<GameState>(state)
    const { play } = useAudio()

    // ── Sons réactifs aux transitions d'état ──────────────────────────────────
    useEffect(() => {
        const prev = prevStateRef.current

        // Rebond mur : la vélocité Y a changé de signe
        const prevVy = prev.ball.velocity.y
        const currVy = state.ball.velocity.y
        if (Math.sign(prevVy) !== Math.sign(currVy) && state.phase === 'playing') {
            play('wall')
        }

        // Rebond raquette : la vélocité X a changé de signe
        const prevVx = prev.ball.velocity.x
        const currVx = state.ball.velocity.x
        if (Math.sign(prevVx) !== Math.sign(currVx) && state.phase === 'playing') {
            play('paddle')
        }

        // Point marqué
        if (prev.phase === 'playing' && state.phase === 'scored') {
            play('score')
        }

        // Victoire
        if (prev.phase !== 'gameover' && state.phase === 'gameover') {
            play('win')
        }

        prevStateRef.current = state
    }, [state, play])

    // ── Boucle de jeu ─────────────────────────────────────────────────────────
    const tick = useCallback((dt: number) => {
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