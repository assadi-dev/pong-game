import type { Paddle } from '../types/game.types'

export function drawPaddle(ctx: CanvasRenderingContext2D, paddle: Paddle) {
    const { x, y } = paddle.position
    const { width, height } = paddle

    // Lueur douce derrière la raquette
    ctx.save()
    ctx.shadowColor = 'rgba(255,255,255,0.35)'
    ctx.shadowBlur = 10

    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, 4)
    ctx.fill()

    ctx.restore()
}