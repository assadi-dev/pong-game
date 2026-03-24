import { describe, it, expect, beforeEach } from 'vitest'
import { computeAIDirection, resetAI } from '../utils/ai'
import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_MARGIN } from '../utils/constants'
import type { Ball, Paddle } from '../types/game.types'

function makePaddleRight(): Paddle {
    return {
        position: { x: CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2 },
        width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0,
    }
}

function makeBall(x: number, y: number, vx = 300, vy = 0): Ball {
    return { position: { x, y }, velocity: { x: vx, y: vy }, size: 12 }
}

beforeEach(() => resetAI())

describe('computeAIDirection', () => {
    it('retourne -1, 0 ou 1 uniquement', () => {
        const paddle = makePaddleRight()
        const ball = makeBall(400, 250)
        const dir = computeAIDirection(paddle, ball, 0.016, 'medium')
        expect([-1, 0, 1]).toContain(dir)
    })

    it('remonte si la balle est au-dessus de la raquette (hard)', () => {
        const paddle = { ...makePaddleRight(), position: { x: 760, y: 350 } }
        const ball = makeBall(600, 50, 300, 0)
        // On force le délai à 0 pour déclencher le calcul immédiatement
        const dir = computeAIDirection(paddle, ball, 1.0, 'hard')
        expect(dir).toBe(-1)
    })

    it('descend si la balle est en dessous de la raquette (hard)', () => {
        const paddle = { ...makePaddleRight(), position: { x: 760, y: 50 } }
        const ball = makeBall(600, 450, 300, 0)
        const dir = computeAIDirection(paddle, ball, 1.0, 'hard')
        expect(dir).toBe(1)
    })

    it('reste immobile si la balle va vers la gauche', () => {
        const paddle = makePaddleRight()
        const ball = makeBall(400, 250, -300, 0) // balle qui s'éloigne
        // Après délai écoulé, cible = centre canvas → raquette déjà centrée ≈ 0
        const dir = computeAIDirection(paddle, ball, 1.0, 'hard')
        expect(dir).toBe(0)
    })
})

describe('resetAI', () => {
    it('remet la cible au centre après reset', () => {
        const paddle = makePaddleRight()
        const ball = makeBall(600, 50, 300, 0)
        computeAIDirection(paddle, ball, 1.0, 'hard') // modifie l'état interne
        resetAI()
        // Après reset + balle qui s'éloigne, la cible revient au centre
        const ballAway = makeBall(400, 250, -300, 0)
        const dir = computeAIDirection(paddle, ballAway, 1.0, 'hard')
        expect(dir).toBe(0)
    })
})