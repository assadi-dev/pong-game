
import type { Ball, Paddle, GameState } from '../types/game.types'
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    BALL_SIZE,
    BALL_SPEED_INIT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_MARGIN,
    WINNING_SCORE,
} from './constants'

// ─── Balle ───────────────────────────────────────────────────────────────────

/**
 * Crée une balle au centre, avec une direction aléatoire
 * mais toujours suffisamment diagonale (angle entre 30° et 60°)
 */
export function createBall(): Ball {
    const angle = (Math.random() * 30 + 30) * (Math.PI / 180)
    const dirX = Math.random() > 0.5 ? 1 : -1
    const dirY = Math.random() > 0.5 ? 1 : -1

    return {
        position: {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT / 2,
        },
        velocity: {
            x: Math.cos(angle) * BALL_SPEED_INIT * dirX,
            y: Math.sin(angle) * BALL_SPEED_INIT * dirY,
        },
        size: BALL_SIZE,
    }
}

// ─── Raquettes ───────────────────────────────────────────────────────────────

export function createPaddleLeft(): Paddle {
    return {
        position: {
            x: PADDLE_MARGIN,
            y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
        },
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        score: 0,
    }
}

export function createPaddleRight(): Paddle {
    return {
        position: {
            x: CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
            y: (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2,
        },
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        score: 0,
    }
}

// ─── État initial complet ─────────────────────────────────────────────────────

export function createInitialState(): GameState {
    return {
        phase: 'menu',
        ball: createBall(),
        paddleLeft: createPaddleLeft(),
        paddleRight: createPaddleRight(),
        winningScore: WINNING_SCORE,
        winner: null,
        gameMode: 'solo',
        difficulty: 'medium',
    }
}