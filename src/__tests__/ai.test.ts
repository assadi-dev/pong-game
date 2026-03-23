import { describe, it, expect, beforeEach, vi } from 'vitest'
import { computeAIDirection, resetAI } from '../utils/ai'
import { createPaddleRight } from '../utils/factories'
import type { Ball } from '../types/game.types'

function makeBall(x: number, y: number, vx = 300, vy = 0): Ball {
    return { position: { x, y }, velocity: { x: vx, y: vy }, size: 12 }
}

beforeEach(() => resetAI())

describe('computeAIDirection', () => {
    it('retourne une valeur entre -1 et 1', () => {
        const paddle = createPaddleRight()
        const ball = makeBall(400, 250)
        const dir = computeAIDirection(paddle, ball, 0.016, 'medium')
        expect(dir).toBeGreaterThanOrEqual(-1)
        expect(dir).toBeLessThanOrEqual(1)
    })

    it('applique le REACTION_SPEED (hard = 0.95)', () => {
        const paddle = { ...createPaddleRight(), position: { x: 760, y: 350 } }
        const ball = makeBall(600, 50, 300, 0)
        const dir = computeAIDirection(paddle, ball, 1.0, 'hard')
        // Monte à vitesse 0.95
        expect(dir).toBeCloseTo(-0.95)
    })

    it('ne prédit pas si la balle est trop loin (easy, x < 400)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5) // offset = (0.5*2 - 1) = 0
        const paddle = createPaddleRight() // centre à 250
        const ball = makeBall(100, 450, 300, 0) // balle en bas à gauche
        const dir = computeAIDirection(paddle, ball, 1.0, 'easy')
        expect(dir).toBe(0)
        vi.restoreAllMocks()
    })

    it('prédit si la balle est proche (easy, x > 400)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5)
        const paddle = createPaddleRight()
        const ball = makeBall(500, 450, 300, 0) // balle en bas à droite
        const dir = computeAIDirection(paddle, ball, 1.0, 'easy')
        // Doit descendre (> 0)
        expect(dir).toBeGreaterThan(0)
        vi.restoreAllMocks()
    })

    it('reste immobile si la balle va vers la gauche', () => {
        const paddle = createPaddleRight()
        const ball = makeBall(400, 250, -300, 0)
        const dir = computeAIDirection(paddle, ball, 1.0, 'hard')
        expect(dir).toBe(0)
    })
})

describe('resetAI', () => {
    it('remet la cible au centre après reset', () => {
        const paddle = createPaddleRight()
        const ball = makeBall(600, 50, 300, 0)
        computeAIDirection(paddle, ball, 1.0, 'hard') // modifie l'état interne
        resetAI()
        // Après reset + balle qui s'éloigne, la cible revient au centre
        const ballAway = makeBall(400, 250, -300, 0)
        const dir = computeAIDirection(paddle, ballAway, 1.0, 'hard')
        expect(dir).toBe(0)
    })
})