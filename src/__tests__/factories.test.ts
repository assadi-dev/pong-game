import { describe, it, expect } from 'vitest'
import { createBall, createPaddleLeft, createPaddleRight, createInitialState } from '../utils/factories'
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    BALL_SIZE,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_MARGIN,
    WINNING_SCORE,
} from '../utils/constants'

describe('createBall', () => {
    it('place la balle au centre du canvas', () => {
        const ball = createBall()
        expect(ball.position.x).toBe(CANVAS_WIDTH / 2)
        expect(ball.position.y).toBe(CANVAS_HEIGHT / 2)
    })

    it('a la bonne taille', () => {
        expect(createBall().size).toBe(BALL_SIZE)
    })

    it('a une vélocité non nulle dans les deux axes', () => {
        const ball = createBall()
        expect(Math.abs(ball.velocity.x)).toBeGreaterThan(0)
        expect(Math.abs(ball.velocity.y)).toBeGreaterThan(0)
    })
})

describe('createPaddleLeft', () => {
    it('est positionné sur le bord gauche', () => {
        const p = createPaddleLeft()
        expect(p.position.x).toBe(PADDLE_MARGIN)
    })

    it('est centré verticalement', () => {
        const p = createPaddleLeft()
        expect(p.position.y).toBe((CANVAS_HEIGHT - PADDLE_HEIGHT) / 2)
    })

    it('a les bonnes dimensions', () => {
        const p = createPaddleLeft()
        expect(p.width).toBe(PADDLE_WIDTH)
        expect(p.height).toBe(PADDLE_HEIGHT)
    })

    it('commence avec un score de 0', () => {
        expect(createPaddleLeft().score).toBe(0)
    })
})

describe('createPaddleRight', () => {
    it('est positionné sur le bord droit', () => {
        const p = createPaddleRight()
        expect(p.position.x).toBe(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH)
    })

    it('commence avec un score de 0', () => {
        expect(createPaddleRight().score).toBe(0)
    })
})

describe('createInitialState', () => {
    it('démarre en phase menu', () => {
        expect(createInitialState().phase).toBe('menu')
    })

    it('a un score gagnant configuré', () => {
        expect(createInitialState().winningScore).toBe(WINNING_SCORE)
    })

    it("n'a pas de gagnant au départ", () => {
        expect(createInitialState().winner).toBeNull()
    })

    it('contient une balle, deux raquettes', () => {
        const state = createInitialState()
        expect(state.ball).toBeDefined()
        expect(state.paddleLeft).toBeDefined()
        expect(state.paddleRight).toBeDefined()
    })
})