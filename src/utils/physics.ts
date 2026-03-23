import type { Ball, Paddle, Vec2 } from '../types/game.types'
import {
    CANVAS_HEIGHT,
    BALL_SPEED_MAX,
    BALL_SPEED_INC,
    PADDLE_SPEED,
} from './constants'

// ─── Vecteurs utilitaires ─────────────────────────────────────────────────────

export function vecLength({ x, y }: Vec2): number {
    return Math.sqrt(x * x + y * y)
}

export function vecNormalize(v: Vec2): Vec2 {
    const len = vecLength(v)
    return len === 0 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len }
}

export function vecScale(v: Vec2, factor: number): Vec2 {
    return { x: v.x * factor, y: v.y * factor }
}

// ─── Mouvement balle ──────────────────────────────────────────────────────────

/**
 * Déplace la balle selon sa vélocité et le delta-time.
 * Retourne une NOUVELLE balle (immutabilité).
 */
export function moveBall(ball: Ball, dt: number): Ball {
    return {
        ...ball,
        position: {
            x: ball.position.x + ball.velocity.x * dt,
            y: ball.position.y + ball.velocity.y * dt,
        },
    }
}

/**
 * Gère le rebond de la balle sur le mur du haut et du bas.
 * Retourne une NOUVELLE balle.
 */
export function bounceWalls(ball: Ball): Ball {
    let vy = ball.velocity.y
    let y = ball.position.y

    if (y - ball.size / 2 <= 0) {
        y = ball.size / 2
        vy = Math.abs(vy)
    } else if (y + ball.size / 2 >= CANVAS_HEIGHT) {
        y = CANVAS_HEIGHT - ball.size / 2
        vy = -Math.abs(vy)
    }

    return {
        ...ball,
        position: { ...ball.position, y },
        velocity: { ...ball.velocity, y: vy },
    }
}

/**
 * Accélère la balle après un rebond sur une raquette,
 * dans la limite de BALL_SPEED_MAX.
 */
export function accelerateBall(ball: Ball): Ball {
    const speed = vecLength(ball.velocity)
    const newSpeed = Math.min(speed + BALL_SPEED_INC, BALL_SPEED_MAX)
    const dir = vecNormalize(ball.velocity)
    return {
        ...ball,
        velocity: vecScale(dir, newSpeed),
    }
}

// ─── Mouvement raquettes ──────────────────────────────────────────────────────

/**
 * Déplace une raquette vers le haut (direction = -1) ou le bas (direction = 1).
 * Empêche la raquette de sortir du canvas.
 */
export function movePaddle(paddle: Paddle, direction: number, dt: number): Paddle {
    if (direction === 0) return paddle

    const newY = paddle.position.y + direction * PADDLE_SPEED * dt
    const clampedY = Math.max(
        0,
        Math.min(newY, CANVAS_HEIGHT - paddle.height)
    )

    return {
        ...paddle,
        position: { ...paddle.position, y: clampedY },
    }
}