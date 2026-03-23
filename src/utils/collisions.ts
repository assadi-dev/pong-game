import type { Ball, Paddle } from '../types/game.types'
import { accelerateBall } from './physics'

// ─── AABB helpers ─────────────────────────────────────────────────────────────

type Rect = { x: number; y: number; w: number; h: number }

function ballRect(ball: Ball): Rect {
    return {
        x: ball.position.x - ball.size / 2,
        y: ball.position.y - ball.size / 2,
        w: ball.size,
        h: ball.size,
    }
}

function paddleRect(paddle: Paddle): Rect {
    return {
        x: paddle.position.x,
        y: paddle.position.y,
        w: paddle.width,
        h: paddle.height,
    }
}

function rectsOverlap(a: Rect, b: Rect): boolean {
    return (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    )
}

// ─── Collision balle / raquette ───────────────────────────────────────────────

export type CollisionResult = {
    ball: Ball
    hit: boolean
}

/**
 * Calcule l'angle de rebond en fonction de l'endroit où la balle
 * touche la raquette.
 *
 * Centre de raquette  → angle plat  (~0°)
 * Bord haut/bas       → angle fort  (~±75°)
 */
function computeReflectAngle(ball: Ball, paddle: Paddle): number {
    const paddleCenterY = paddle.position.y + paddle.height / 2
    const relativeHit = (ball.position.y - paddleCenterY) / (paddle.height / 2)
    const maxAngle = 75 * (Math.PI / 180)
    return relativeHit * maxAngle
}

/**
 * Teste la collision entre la balle et la raquette gauche.
 * Si collision : inverse vx, calcule le nouvel angle, accélère.
 */
export function collideBallPaddleLeft(ball: Ball, paddle: Paddle): CollisionResult {
    const br = ballRect(ball)
    const pr = paddleRect(paddle)

    if (!rectsOverlap(br, pr)) return { ball, hit: false }

    const angle = computeReflectAngle(ball, paddle)
    const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)

    const newBall: Ball = {
        ...ball,
        // Repositionne la balle hors de la raquette
        position: {
            ...ball.position,
            x: paddle.position.x + paddle.width + ball.size / 2,
        },
        velocity: {
            x: Math.cos(angle) * speed,  // toujours vers la droite
            y: Math.sin(angle) * speed,
        },
    }

    return { ball: accelerateBall(newBall), hit: true }
}

/**
 * Teste la collision entre la balle et la raquette droite.
 */
export function collideBallPaddleRight(ball: Ball, paddle: Paddle): CollisionResult {
    const br = ballRect(ball)
    const pr = paddleRect(paddle)

    if (!rectsOverlap(br, pr)) return { ball, hit: false }

    const angle = computeReflectAngle(ball, paddle)
    const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)

    const newBall: Ball = {
        ...ball,
        position: {
            ...ball.position,
            x: paddle.position.x - ball.size / 2,
        },
        velocity: {
            x: -Math.cos(angle) * speed,  // toujours vers la gauche
            y: Math.sin(angle) * speed,
        },
    }

    return { ball: accelerateBall(newBall), hit: true }
}

// ─── Détection de point ───────────────────────────────────────────────────────

/**
 * Retourne quel joueur a marqué, ou null si personne.
 */
export function detectPoint(ball: Ball): 'left' | 'right' | null {
    if (ball.position.x + ball.size / 2 < 0) return 'right' // sort à gauche  → droite marque
    if (ball.position.x - ball.size / 2 > 800) return 'left'  // sort à droite  → gauche marque
    return null
}