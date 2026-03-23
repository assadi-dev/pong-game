import { describe, it, expect } from 'vitest'
import { gameReducer } from '../utils/gameReducer'
import { createInitialState } from '../utils/factories'
import { WINNING_SCORE } from '../utils/constants'
import type { GameState } from '../types/game.types'

const noKeys = { w: false, s: false, ArrowUp: false, ArrowDown: false }

function playingState(): GameState {
    return { ...createInitialState(), phase: 'playing' }
}

function tickN(state: GameState, n: number): GameState {
    let s = state
    for (let i = 0; i < n; i++) {
        s = gameReducer(s, { type: 'TICK', deltaTime: 0.016, keys: noKeys })
    }
    return s
}

// ─── Scénario complet : partie solo jusqu'à la victoire ──────────────────────

describe('Scénario — partie complète', () => {
    it('une partie PvP se termine bien en gameover', () => {
        // Forcer plusieurs points rapides en plaçant la balle hors du canvas
        let state = playingState()

        for (let point = 0; point < WINNING_SCORE; point++) {
            // Balle hors du canvas à droite → joueur gauche marque
            state = {
                ...state,
                phase: 'playing',
                ball: { position: { x: 820, y: 250 }, velocity: { x: 300, y: 0 }, size: 12 },
            }
            state = gameReducer(state, { type: 'TICK', deltaTime: 0.016, keys: noKeys })

            if (state.phase === 'scored') {
                state = gameReducer(state, { type: 'RESUME_AFTER_POINT' })
                state = { ...state, phase: 'playing' }
            }
        }

        expect(state.phase).toBe('gameover')
        expect(state.winner).toBe('left')
        expect(state.paddleLeft.score).toBe(WINNING_SCORE)
    })

    it('rejouer après gameover remet tout à zéro', () => {
        let state: GameState = {
            ...playingState(),
            phase: 'gameover',
            winner: 'left',
            paddleLeft: { ...createInitialState().paddleLeft, score: WINNING_SCORE },
            paddleRight: { ...createInitialState().paddleRight, score: 3 },
        }

        state = gameReducer(state, { type: 'START_GAME' })

        expect(state.phase).toBe('playing')
        expect(state.paddleLeft.score).toBe(0)
        expect(state.paddleRight.score).toBe(0)
        expect(state.winner).toBeNull()
    })
})

// ─── Scénario : pause en cours de partie ─────────────────────────────────────

describe('Scénario — pause', () => {
    it('la balle ne bouge pas pendant la pause', () => {
        const state = playingState()
        const paused = gameReducer(state, { type: 'PAUSE_TOGGLE' })
        const ballX = paused.ball.position.x

        const after = tickN(paused, 10)
        expect(after.ball.position.x).toBe(ballX)
    })

    it('la partie reprend correctement après une pause', () => {
        const state = playingState()
        const paused = gameReducer(state, { type: 'PAUSE_TOGGLE' })
        const resumed = gameReducer(paused, { type: 'PAUSE_TOGGLE' })

        expect(resumed.phase).toBe('playing')

        const after = tickN(resumed, 5)
        expect(after.ball.position.x).not.toBe(resumed.ball.position.x)
    })
})

// ─── Scénario : mode solo ─────────────────────────────────────────────────────

describe('Scénario — mode solo', () => {
    it('SET_MODE applique bien le mode et la difficulté', () => {
        const state = gameReducer(createInitialState(), {
            type: 'SET_MODE', gameMode: 'solo', difficulty: 'hard',
        })
        expect(state.gameMode).toBe('solo')
        expect(state.difficulty).toBe('hard')
    })

    it('le mode est conservé après START_GAME', () => {
        let state = createInitialState()
        state = gameReducer(state, { type: 'SET_MODE', gameMode: 'solo', difficulty: 'easy' })
        state = gameReducer(state, { type: 'START_GAME' })

        expect(state.gameMode).toBe('solo')
        expect(state.difficulty).toBe('easy')
    })
})

// ─── Scénario : balle reste dans le canvas ────────────────────────────────────

describe('Scénario — physique sur 300 ticks', () => {
    it('la balle reste dans les limites verticales', () => {
        const CANVAS_HEIGHT = 500
        let state = playingState()

        for (let i = 0; i < 300; i++) {
            state = gameReducer(state, { type: 'TICK', deltaTime: 0.016, keys: noKeys })
            if (state.phase !== 'playing') {
                state = { ...state, phase: 'playing', ball: createInitialState().ball }
            }
            const { y } = state.ball.position
            expect(y).toBeGreaterThanOrEqual(0)
            expect(y).toBeLessThanOrEqual(CANVAS_HEIGHT)
        }
    })
})