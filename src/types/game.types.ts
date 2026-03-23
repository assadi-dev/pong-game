// ─── Géométrie de base ───────────────────────────────────────────────────────

export type Vec2 = {
    x: number
    y: number
}

// ─── Entités du jeu ──────────────────────────────────────────────────────────

export type Ball = {
    position: Vec2
    velocity: Vec2
    size: number
}

export type Paddle = {
    position: Vec2   // coin supérieur gauche
    width: number
    height: number
    score: number
}

// ─── Phases de jeu ───────────────────────────────────────────────────────────

export type GamePhase =
    | 'menu'
    | 'playing'
    | 'paused'
    | 'scored'     // bref freeze après un point
    | 'gameover'

// ─── État global ─────────────────────────────────────────────────────────────

export type GameState = {
    phase: GamePhase
    ball: Ball
    paddleLeft: Paddle
    paddleRight: Paddle
    winningScore: number
    winner: 'left' | 'right' | null
}

// ─── Actions du reducer ──────────────────────────────────────────────────────

export type GameAction =
    | { type: 'START_GAME' }
    | { type: 'PAUSE_TOGGLE' }
    | { type: 'TICK'; deltaTime: number; keys: KeysPressed }
    | { type: 'POINT_SCORED'; side: 'left' | 'right' }
    | { type: 'RESUME_AFTER_POINT' }
    | { type: 'RESET_GAME' }

// ─── Inputs clavier ──────────────────────────────────────────────────────────

export type KeysPressed = {
    w: boolean
    s: boolean
    ArrowUp: boolean
    ArrowDown: boolean
}