import type { Ball, Paddle, Difficulty } from '../types/game.types'
import { CANVAS_HEIGHT } from './constants'



// Vitesse de réaction de l'IA selon la difficulté (fraction de PADDLE_SPEED)
const REACTION_SPEED: Record<Difficulty, number> = {
    easy: 0.22,
    medium: 0.52,
    hard: 0.95,
}

// Marge d'erreur en px : l'IA vise le centre ± cette valeur
const AIM_ERROR: Record<Difficulty, number> = {
    easy: 250,
    medium: 150,
    hard: 5,
}

// Délai de réaction en secondes : l'IA ignore la balle pendant ce temps
const REACTION_DELAY: Record<Difficulty, number> = {
    easy: 0.9,
    medium: 0.65,
    hard: 0.45,
}

type AIState = {
    targetY: number   // position Y visée par l'IA
    delayTimer: number   // temps écoulé depuis le dernier recalcul
    errorOffset: number  // décalage aléatoire simulant l'erreur humaine
}

// État interne de l'IA (réinitialisé à chaque partie)
let aiState: AIState = {
    targetY: CANVAS_HEIGHT / 2,
    delayTimer: 0,
    errorOffset: 0,
}

export function resetAI() {
    aiState = {
        targetY: CANVAS_HEIGHT / 2,
        delayTimer: 0,
        errorOffset: 0,
    }
}

/**
 * Calcule la direction de la raquette droite contrôlée par l'IA.
 * Retourne une valeur entre -1 et 1.
 */
export function computeAIDirection(
    paddle: Paddle,
    ball: Ball,
    dt: number,
    difficulty: Difficulty,
): number {
    const delay = REACTION_DELAY[difficulty]

    // Accumule le temps de réaction
    aiState.delayTimer += dt

    // Recalcule la cible seulement après le délai de réaction
    if (aiState.delayTimer >= delay) {
        aiState.delayTimer = 0
        aiState.errorOffset = (Math.random() * 2 - 1) * AIM_ERROR[difficulty]

        // Prédit la position Y de la balle quand elle arrivera à la raquette
        aiState.targetY = predictBallY(ball, difficulty) + aiState.errorOffset
    }

    const paddleCenterY = paddle.position.y + paddle.height / 2
    const deadZone = 6 // px — évite les micro-oscillations

    const diff = aiState.targetY - paddleCenterY

    if (Math.abs(diff) < deadZone) return 0
    const direction = diff < 0 ? -1 : 1

    // Applique la vitesse de réaction
    return direction * REACTION_SPEED[difficulty]
}

/**
 * Prédit la position Y de la balle quand elle atteindra le bord droit,
 * en simulant les rebonds sur les murs haut et bas.
 */
function predictBallY(ball: Ball, difficulty: Difficulty): number {
    const { x, y } = ball.position
    const { x: vx, y: vy } = ball.velocity

    // La balle s'éloigne → rester au centre
    if (vx <= 0) return CANVAS_HEIGHT / 2

    // Facile : ne prédit que si la balle est déjà proche (600px)
    if (difficulty === 'easy' && x < 600) return CANVAS_HEIGHT / 2

    // Moyen : ne prédit que si la balle a passé la moitié
    if (difficulty === 'medium' && x < 350) return CANVAS_HEIGHT / 2

    // Distance horizontale jusqu'au bord droit (approximatif)
    const targetX = 780
    const timeLeft = (targetX - x) / vx

    let predictedY = y + vy * timeLeft

    // Simule les rebonds sur les murs
    predictedY = simulateBounces(predictedY)

    return Math.max(0, Math.min(predictedY, CANVAS_HEIGHT))
}

function simulateBounces(y: number): number {
    // Ramène y dans [0, CANVAS_HEIGHT] en simulant les rebonds
    const range = CANVAS_HEIGHT
    y = ((y % (range * 2)) + range * 2) % (range * 2)
    if (y > range) y = range * 2 - y
    return y
}