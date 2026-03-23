import { useRef, useCallback } from 'react'
import { useGameLoop } from '../hooks/useGameLoop'
import { useKeyboard } from '../hooks/useKeyboard'
import { moveBall, bounceWalls, movePaddle } from '../utils/physics'
import { collideBallPaddleLeft, collideBallPaddleRight, detectPoint } from '../utils/collisions'
import { directionLeft, directionRight } from '../utils/input'
import { createBall, createPaddleLeft, createPaddleRight } from '../utils/factories'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants'
import type { Ball, Paddle } from '../types/game.types'

// ─── Rendu ────────────────────────────────────────────────────────────────────

function drawScene(ctx: CanvasRenderingContext2D, ball: Ball, left: Paddle, right: Paddle) {
    // Fond
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Ligne centrale pointillée
    ctx.setLineDash([10, 10])
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()
    ctx.setLineDash([])

    // Raquettes
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(left.position.x, left.position.y, left.width, left.height)
    ctx.fillRect(right.position.x, right.position.y, right.width, right.height)

    // Balle
    ctx.fillRect(
        ball.position.x - ball.size / 2,
        ball.position.y - ball.size / 2,
        ball.size,
        ball.size,
    )
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ballRef = useRef<Ball>(createBall())
    const leftRef = useRef<Paddle>(createPaddleLeft())
    const rightRef = useRef<Paddle>(createPaddleRight())
    const keysRef = useKeyboard()

    const tick = useCallback((dt: number) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const keys = keysRef.current

        // Déplacer les raquettes
        leftRef.current = movePaddle(leftRef.current, directionLeft(keys), dt)
        rightRef.current = movePaddle(rightRef.current, directionRight(keys), dt)

        // Déplacer la balle
        let ball = moveBall(ballRef.current, dt)
        ball = bounceWalls(ball)

        // Collisions raquettes
        const { ball: ballAfterLeft } = collideBallPaddleLeft(ball, leftRef.current)
        ball = ballAfterLeft
        const { ball: ballAfterRight } = collideBallPaddleRight(ball, rightRef.current)
        ball = ballAfterRight

        // Point marqué → reset balle (pas de score encore, Phase 6)
        if (detectPoint(ball) !== null) {
            ball = createBall()
        }

        ballRef.current = ball

        drawScene(ctx, ball, leftRef.current, rightRef.current)
    }, [keysRef])

    useGameLoop(tick, true)

    return (
        <div style={{ textAlign: 'center' }}>
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{
                    display: 'block',
                    margin: '0 auto',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                }}
            />
            <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', fontSize: '12px', marginTop: '12px' }}>
                Joueur gauche : W / S &nbsp;|&nbsp; Joueur droit : ↑ / ↓
            </p>
        </div>
    )
}