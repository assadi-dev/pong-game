import { useRef, useCallback } from 'react'
import { useGameLoop } from '../hooks/useGameloop'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants'

// Démo Phase 2 : une balle qui rebondit sur les murs
type Ball = {
    x: number
    y: number
    vx: number
    vy: number
    size: number
}

const initBall = (): Ball => ({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    vx: 300,
    vy: 220,
    size: 12,
})

function drawScene(ctx: CanvasRenderingContext2D, ball: Ball) {
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

    // Balle
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(ball.x - ball.size / 2, ball.y - ball.size / 2, ball.size, ball.size)
}

export function GameCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const ballRef = useRef<Ball>(initBall())

    const tick = useCallback((dt: number) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const ball = ballRef.current

        // Mouvement
        ball.x += ball.vx * dt
        ball.y += ball.vy * dt

        // Rebond haut / bas
        if (ball.y - ball.size / 2 <= 0) {
            ball.y = ball.size / 2
            ball.vy = Math.abs(ball.vy)
        }
        if (ball.y + ball.size / 2 >= CANVAS_HEIGHT) {
            ball.y = CANVAS_HEIGHT - ball.size / 2
            ball.vy = -Math.abs(ball.vy)
        }

        // Rebond gauche / droite (démo — pas de score encore)
        if (ball.x - ball.size / 2 <= 0) {
            ball.x = ball.size / 2
            ball.vx = Math.abs(ball.vx)
        }
        if (ball.x + ball.size / 2 >= CANVAS_WIDTH) {
            ball.x = CANVAS_WIDTH - ball.size / 2
            ball.vx = -Math.abs(ball.vx)
        }

        drawScene(ctx, ball)
    }, [])

    useGameLoop(tick, true)

    return (
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
    )
}