import type { Ball } from '../types/game.types'

// Historique des positions pour la traînée
const TRAIL_LENGTH = 6
const trail: Array<{ x: number; y: number }> = []

export function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
    const { x, y } = ball.position

    // Mise à jour de la traînée
    trail.push({ x, y })
    if (trail.length > TRAIL_LENGTH) trail.shift()

    // Traînée (du plus ancien au plus récent)
    trail.forEach((pos, i) => {
        const alpha = (i / TRAIL_LENGTH) * 0.3
        const shrink = (i / TRAIL_LENGTH) * (ball.size * 0.5)
        const size = Math.max(0, ball.size - shrink)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.roundRect(
            pos.x - size / 2,
            pos.y - size / 2,
            size,
            size,
            2,
        )
        ctx.fill()
        ctx.restore()
    })

    // Balle principale avec lueur
    ctx.save()
    ctx.shadowColor = 'rgba(255,255,255,0.6)'
    ctx.shadowBlur = 12

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(
        x - ball.size / 2,
        y - ball.size / 2,
        ball.size,
        ball.size,
        2,
    )
    ctx.fill()
    ctx.restore()
}

export function resetTrail() {
    trail.length = 0
}