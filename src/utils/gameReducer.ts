import type { GameState, GameAction } from '../types/game.types'
import { createBall, createInitialState } from './factories'
import { moveBall, bounceWalls, movePaddle } from './physics'
import { collideBallPaddleLeft, collideBallPaddleRight, detectPoint } from './collisions'
import { directionLeft, directionRight } from './input'

// Transition après un point handled in useGameState.ts


// Accumule le temps passé en phase 'scored'


export function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {

        case 'START_GAME':
            return {
                ...createInitialState(),
                phase: 'playing',
            }

        case 'RESET_GAME':
            return createInitialState()

        case 'PAUSE_TOGGLE':
            if (state.phase === 'playing') return { ...state, phase: 'paused' }
            if (state.phase === 'paused') return { ...state, phase: 'playing' }
            return state

        // ── Tick principal ────────────────────────────────────────────────────────
        case 'TICK': {
            if (state.phase !== 'playing') return state

            const { deltaTime, keys } = action

            // Raquettes
            const paddleLeft = movePaddle(state.paddleLeft, directionLeft(keys), deltaTime)
            const paddleRight = movePaddle(state.paddleRight, directionRight(keys), deltaTime)

            // Balle
            let ball = moveBall(state.ball, deltaTime)
            ball = bounceWalls(ball)

            const { ball: ballL, hit: hitL } = collideBallPaddleLeft(ball, paddleLeft)
            ball = ballL
            const { ball: ballR, hit: hitR } = collideBallPaddleRight(ball, paddleRight)
            ball = ballR

            void hitL; void hitR // utilisés en Phase 8 pour les sons

            // Point marqué ?
            const scorer = detectPoint(ball)
            if (scorer !== null) {
                const newLeft = { ...paddleLeft, score: paddleLeft.score + (scorer === 'left' ? 1 : 0) }
                const newRight = { ...paddleRight, score: paddleRight.score + (scorer === 'right' ? 1 : 0) }

                // Victoire ?
                if (newLeft.score >= state.winningScore || newRight.score >= state.winningScore) {
                    return {
                        ...state,
                        phase: 'gameover',
                        ball: createBall(),
                        paddleLeft: newLeft,
                        paddleRight: newRight,
                        winner: newLeft.score >= state.winningScore ? 'left' : 'right',
                    }
                }

                return {
                    ...state,
                    phase: 'scored',
                    ball: createBall(),
                    paddleLeft: newLeft,
                    paddleRight: newRight,
                }
            }

            return { ...state, ball, paddleLeft, paddleRight }
        }

        // ── Transition après un point ─────────────────────────────────────────────
        case 'RESUME_AFTER_POINT': {
            if (state.phase !== 'scored') return state
            return { ...state, phase: 'playing' }
        }

        default:
            return state
    }
}