import type { GameState, GameAction } from '../types/game.types'
import { createBall, createInitialState } from './factories'
import { moveBall, bounceWalls, movePaddle } from './physics'
import { collideBallPaddleLeft, collideBallPaddleRight, detectPoint } from './collisions'
import { directionLeft, directionRight } from './input'
import { computeAIDirection, resetAI } from './ai'

// Délai de freeze après un point (en secondes)

// Transition après un point handled in useGameState.ts

export function gameReducer(state: GameState, action: GameAction): GameState {

    switch (action.type) {

        case 'START_GAME':
            resetAI()
            return {
                ...createInitialState(),
                phase: 'playing',
                gameMode: action.gameMode ?? state.gameMode,
                difficulty: action.difficulty ?? state.difficulty,
            }

        case 'RESET_GAME':
            return createInitialState()

        case 'PAUSE_TOGGLE':
            if (state.phase === 'playing') return { ...state, phase: 'paused' }
            if (state.phase === 'paused') return { ...state, phase: 'playing' }
            return state


        case 'SET_MODE':
            return {
                ...state,
                gameMode: action.gameMode,
                difficulty: action.difficulty,
            }

        // ── Tick principal ────────────────────────────────────────────────────────
        case 'TICK': {
            if (state.phase !== 'playing') return state

            const { deltaTime, keys } = action

            // Raquettes
            const paddleLeft = movePaddle(state.paddleLeft, directionLeft(keys), deltaTime)

            // Joueur 2 ou IA selon le mode
            const rightDir = state.gameMode === 'solo'
                ? computeAIDirection(state.paddleRight, state.ball, deltaTime, state.difficulty)
                : directionRight(keys)
            const paddleRight = movePaddle(state.paddleRight, rightDir, deltaTime)

            // Balle
            let ball = moveBall(state.ball, deltaTime)
            ball = bounceWalls(ball)

            const { ball: ballL, hit: hitL } = collideBallPaddleLeft(ball, paddleLeft)
            ball = ballL
            const { ball: ballR, hit: hitR } = collideBallPaddleRight(ball, paddleRight)
            ball = ballR

            void hitL; void hitR // les sons sont détectés dans useGameState via les changements de vélocité

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