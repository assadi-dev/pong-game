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
 * Rebond linéaire : conserve la composante Y d'entrée,
 * inverse vx, et applique une légère déviation selon
 * l'endroit touché sur la raquette (max ±35°).
 *
 * Résultat : trajectoires prévisibles et naturelles.
 */
function reflectLinear(ball: Ball, paddle: Paddle, dirX: 1 | -1): Ball {
    const paddleCenterY = paddle.position.y + paddle.height / 2
    const relativeHit = (ball.position.y - paddleCenterY) / (paddle.height / 2)

    // Déviation max réduite à 35° — trajectoires bien plus linéaires
    const MAX_DEFLECT = 35 * (Math.PI / 180)
    const deflect = relativeHit * MAX_DEFLECT

    const speed = Math.sqrt(ball.velocity.x ** 2 + ball.velocity.y ** 2)

    return {
        ...ball,
        velocity: {
            x: Math.cos(deflect) * speed * dirX,
            y: Math.sin(deflect) * speed,
        },
    }
}

/**
 * Teste la collision entre la balle et la raquette gauche.
 */
export function collideBallPaddleLeft(ball: Ball, paddle: Paddle): CollisionResult {
    const br = ballRect(ball)
    const pr = paddleRect(paddle)

    if (!rectsOverlap(br, pr)) return { ball, hit: false }

    const reflected: Ball = {
        ...reflectLinear(ball, paddle, 1),
        position: {
            ...ball.position,
            x: paddle.position.x + paddle.width + ball.size / 2,
        },
    }

    return { ball: accelerateBall(reflected), hit: true }
}

/**
 * Teste la collision entre la balle et la raquette droite.
 */
export function collideBallPaddleRight(ball: Ball, paddle: Paddle): CollisionResult {
    const br = ballRect(ball)
    const pr = paddleRect(paddle)

    if (!rectsOverlap(br, pr)) return { ball, hit: false }

    const reflected: Ball = {
        ...reflectLinear(ball, paddle, -1),
        position: {
            ...ball.position,
            x: paddle.position.x - ball.size / 2,
        },
    }

    return { ball: accelerateBall(reflected), hit: true }
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