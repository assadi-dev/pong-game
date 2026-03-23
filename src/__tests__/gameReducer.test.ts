import { describe, it, expect } from 'vitest'
import { gameReducer } from '../utils/gameReducer'
import { createInitialState } from '../utils/factories'
import { WINNING_SCORE } from '../utils/constants'
import type { GameState } from '../types/game.types'

const noKeys = { w: false, s: false, ArrowUp: false, ArrowDown: false }

function playingState(): GameState {
    return { ...createInitialState(), phase: 'playing' }
}

describe('gameReducer — START_GAME', () => {
    it('passe en phase playing', () => {
        const state = gameReducer(createInitialState(), { type: 'START_GAME' })
        expect(state.phase).toBe('playing')
    })

    it('remet les scores à 0', () => {
        const dirty: GameState = {
            ...playingState(),
            paddleLeft: { ...createInitialState().paddleLeft, score: 3 },
            paddleRight: { ...createInitialState().paddleRight, score: 5 },
        }
        const state = gameReducer(dirty, { type: 'START_GAME' })
        expect(state.paddleLeft.score).toBe(0)
        expect(state.paddleRight.score).toBe(0)
    })
})

describe('gameReducer — PAUSE_TOGGLE', () => {
    it('met en pause depuis playing', () => {
        const state = gameReducer(playingState(), { type: 'PAUSE_TOGGLE' })
        expect(state.phase).toBe('paused')
    })

    it('reprend depuis paused', () => {
        const paused: GameState = { ...playingState(), phase: 'paused' }
        const state = gameReducer(paused, { type: 'PAUSE_TOGGLE' })
        expect(state.phase).toBe('playing')
    })

    it("n'agit pas si on est en gameover", () => {
        const over: GameState = { ...playingState(), phase: 'gameover' }
        expect(gameReducer(over, { type: 'PAUSE_TOGGLE' }).phase).toBe('gameover')
    })
})

describe('gameReducer — RESET_GAME', () => {
    it('repasse en phase menu avec scores à 0', () => {
        const state = gameReducer(playingState(), { type: 'RESET_GAME' })
        expect(state.phase).toBe('menu')
        expect(state.paddleLeft.score).toBe(0)
        expect(state.paddleRight.score).toBe(0)
        expect(state.winner).toBeNull()
    })
})

describe('gameReducer — TICK', () => {
    it("n'agit pas si la phase n'est pas playing", () => {
        const paused: GameState = { ...playingState(), phase: 'paused' }
        const state = gameReducer(paused, { type: 'TICK', deltaTime: 0.016, keys: noKeys })
        expect(state).toBe(paused)
    })

    it('déplace la balle à chaque tick', () => {
        const state = playingState()
        const before = state.ball.position.x
        const after = gameReducer(state, { type: 'TICK', deltaTime: 0.1, keys: noKeys })
        expect(after.ball.position.x).not.toBe(before)
    })
})

describe('gameReducer — point & victoire', () => {
    it('incrémente le score du joueur droit si balle sort à gauche', () => {
        const state: GameState = {
            ...playingState(),
            ball: { position: { x: -20, y: 250 }, velocity: { x: -300, y: 0 }, size: 12 },
        }
        const next = gameReducer(state, { type: 'TICK', deltaTime: 0.016, keys: noKeys })
        expect(next.paddleRight.score).toBe(1)
    })

    it('incrémente le score du joueur gauche si balle sort à droite', () => {
        const state: GameState = {
            ...playingState(),
            ball: { position: { x: 820, y: 250 }, velocity: { x: 300, y: 0 }, size: 12 },
        }
        const next = gameReducer(state, { type: 'TICK', deltaTime: 0.016, keys: noKeys })
        expect(next.paddleLeft.score).toBe(1)
    })

    it('passe en gameover quand le score gagnant est atteint', () => {
        const state: GameState = {
            ...playingState(),
            ball: { position: { x: -20, y: 250 }, velocity: { x: -300, y: 0 }, size: 12 },
            paddleRight: { ...createInitialState().paddleRight, score: WINNING_SCORE - 1 },
        }
        const next = gameReducer(state, { type: 'TICK', deltaTime: 0.016, keys: noKeys })
        expect(next.phase).toBe('gameover')
        expect(next.winner).toBe('right')
    })

    it('passe en phase scored si pas encore gagnant', () => {
        const state: GameState = {
            ...playingState(),
            ball: { position: { x: -20, y: 250 }, velocity: { x: -300, y: 0 }, size: 12 },
        }
        const next = gameReducer(state, { type: 'TICK', deltaTime: 0.016, keys: noKeys })
        expect(next.phase).toBe('scored')
    })
})