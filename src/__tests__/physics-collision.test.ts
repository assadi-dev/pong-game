import { describe, it, expect } from 'vitest'
import {
    moveBall,
    bounceWalls,
    accelerateBall,
    movePaddle,
    vecLength,
} from '../utils/physics'
import {
    collideBallPaddleLeft,
    collideBallPaddleRight,
    detectPoint,
} from '../utils/collisions'
import { createPaddleLeft, createPaddleRight } from '../utils/factories'
import { CANVAS_HEIGHT, BALL_SPEED_MAX, BALL_SPEED_INIT } from '../utils/constants'
import type { Ball, Paddle } from '../types/game.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type BallOverrides = { x?: number; y?: number; vx?: number; vy?: number }

function makeBall({ x = 400, y = 250, vx = 300, vy = 200 }: BallOverrides = {}): Ball {
    return {
        position: { x, y },
        velocity: { x: vx, y: vy },
        size: 12,
    }
}

// ─── Physics ──────────────────────────────────────────────────────────────────

describe('moveBall', () => {
    it('déplace la balle selon sa vélocité et le dt', () => {
        const ball = makeBall()
        const moved = moveBall(ball, 0.1)
        expect(moved.position.x).toBeCloseTo(430)
        expect(moved.position.y).toBeCloseTo(270)
    })

    it('ne mute pas la balle originale', () => {
        const ball = makeBall()
        const originalX = ball.position.x
        moveBall(ball, 0.5)
        expect(ball.position.x).toBe(originalX)
    })
})

describe('bounceWalls', () => {
    it('rebondit sur le mur du haut', () => {
        const ball: Ball = { position: { x: 400, y: 2 }, velocity: { x: 100, y: -200 }, size: 12 }
        const bounced = bounceWalls(ball)
        expect(bounced.velocity.y).toBeGreaterThan(0)
        expect(bounced.position.y).toBeGreaterThanOrEqual(6)
    })

    it('rebondit sur le mur du bas', () => {
        const ball: Ball = { position: { x: 400, y: CANVAS_HEIGHT - 2 }, velocity: { x: 100, y: 200 }, size: 12 }
        const bounced = bounceWalls(ball)
        expect(bounced.velocity.y).toBeLessThan(0)
    })

    it('ne rebondit pas si la balle est au centre', () => {
        const ball = makeBall()
        const bounced = bounceWalls(ball)
        expect(bounced.velocity.y).toBe(ball.velocity.y)
    })
})

describe('accelerateBall', () => {
    it('augmente la vitesse de la balle', () => {
        const ball = makeBall()
        const before = vecLength(ball.velocity)
        const after = vecLength(accelerateBall(ball).velocity)
        expect(after).toBeGreaterThan(before)
    })

    it('ne dépasse pas BALL_SPEED_MAX', () => {
        let ball: Ball = { position: { x: 400, y: 250 }, velocity: { x: BALL_SPEED_MAX, y: 0 }, size: 12 }
        for (let i = 0; i < 20; i++) ball = accelerateBall(ball)
        expect(vecLength(ball.velocity)).toBeLessThanOrEqual(BALL_SPEED_MAX + 1)
    })
})

describe('movePaddle', () => {
    it('déplace vers le bas avec direction=1', () => {
        const paddle = createPaddleLeft()
        const startY = paddle.position.y
        const moved = movePaddle(paddle, 1, 0.1)
        expect(moved.position.y).toBeGreaterThan(startY)
    })

    it('déplace vers le haut avec direction=-1', () => {
        const paddle = createPaddleLeft()
        const startY = paddle.position.y
        const moved = movePaddle(paddle, -1, 0.1)
        expect(moved.position.y).toBeLessThan(startY)
    })

    it('ne sort pas du bas du canvas', () => {
        const paddle: Paddle = { ...createPaddleLeft(), position: { x: 20, y: CANVAS_HEIGHT - 10 } }
        const moved = movePaddle(paddle, 1, 1)
        expect(moved.position.y + moved.height).toBeLessThanOrEqual(CANVAS_HEIGHT)
    })

    it('ne sort pas du haut du canvas', () => {
        const paddle: Paddle = { ...createPaddleLeft(), position: { x: 20, y: 5 } }
        const moved = movePaddle(paddle, -1, 1)
        expect(moved.position.y).toBeGreaterThanOrEqual(0)
    })

    it('ne bouge pas si direction=0', () => {
        const paddle = createPaddleLeft()
        expect(movePaddle(paddle, 0, 0.1)).toBe(paddle)
    })
})

// ─── Collisions ───────────────────────────────────────────────────────────────

describe('collideBallPaddleLeft', () => {
    it('détecte une collision et inverse vx', () => {
        const paddle = createPaddleLeft()
        const ball: Ball = {
            position: { x: paddle.position.x + paddle.width + 2, y: paddle.position.y + paddle.height / 2 },
            velocity: { x: -BALL_SPEED_INIT, y: 0 },
            size: 12,
        }
        const { ball: newBall, hit } = collideBallPaddleLeft(ball, paddle)
        expect(hit).toBe(true)
        expect(newBall.velocity.x).toBeGreaterThan(0)
    })

    it('ne déclenche pas de collision si la balle est loin', () => {
        const paddle = createPaddleLeft()
        const ball = makeBall()
        const { hit } = collideBallPaddleLeft(ball, paddle)
        expect(hit).toBe(false)
    })
})

describe('collideBallPaddleRight', () => {
    it('détecte une collision et inverse vx', () => {
        const paddle = createPaddleRight()
        const ball: Ball = {
            position: { x: paddle.position.x - 2, y: paddle.position.y + paddle.height / 2 },
            velocity: { x: BALL_SPEED_INIT, y: 0 },
            size: 12,
        }
        const { ball: newBall, hit } = collideBallPaddleRight(ball, paddle)
        expect(hit).toBe(true)
        expect(newBall.velocity.x).toBeLessThan(0)
    })
})

describe('detectPoint', () => {
    it('détecte un point pour le joueur droit si balle sort à gauche', () => {
        const ball: Ball = { position: { x: -10, y: 250 }, velocity: { x: -300, y: 0 }, size: 12 }
        expect(detectPoint(ball)).toBe('right')
    })

    it('détecte un point pour le joueur gauche si balle sort à droite', () => {
        const ball: Ball = { position: { x: 810, y: 250 }, velocity: { x: 300, y: 0 }, size: 12 }
        expect(detectPoint(ball)).toBe('left')
    })

    it('retourne null si la balle est dans le canvas', () => {
        expect(detectPoint(makeBall())).toBeNull()
    })
})