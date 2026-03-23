import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants'

export function drawBackground(ctx: CanvasRenderingContext2D, scored: boolean) {
    // Fond principal
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Flash subtil post-point
    if (scored) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    }

    // Ligne centrale pointillée
    ctx.save()
    ctx.setLineDash([8, 12])
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()
    ctx.restore()

    // Cercle central
    ctx.save()
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 60, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
}