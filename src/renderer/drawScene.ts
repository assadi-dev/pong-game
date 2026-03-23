import type { GameState } from "../types/game.types"
import { drawBackground } from "./drawBackground"
import { drawBall, resetTrail } from "./drawBall"
import { drawPaddle } from "./drawPaddle"


export function drawScene(ctx: CanvasRenderingContext2D, state: GameState) {
    const { ball, paddleLeft, paddleRight, phase } = state

    drawBackground(ctx, phase === 'scored')
    drawPaddle(ctx, paddleLeft)
    drawPaddle(ctx, paddleRight)
    drawBall(ctx, ball)
}

export { resetTrail }