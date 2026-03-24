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
    gameMode: GameMode
    difficulty: Difficulty
}


// ─── Mode de jeu & difficulté ─────────────────────────────────────────────────

export type GameMode = 'pvp' | 'solo'
export type Difficulty = 'easy' | 'medium' | 'hard'

// ─── Actions du reducer ──────────────────────────────────────────────────────

export type GameAction =
    | { type: 'START_GAME'; gameMode?: GameMode; difficulty?: Difficulty }
    | { type: 'PAUSE_TOGGLE' }
    | { type: 'TICK'; deltaTime: number; keys: KeysPressed }
    | { type: 'POINT_SCORED'; side: 'left' | 'right' }
    | { type: 'RESUME_AFTER_POINT' }
    | { type: 'RESET_GAME' }
    | { type: 'SET_MODE'; gameMode: GameMode; difficulty: Difficulty }

// ─── Inputs clavier ──────────────────────────────────────────────────────────

export type KeysPressed = {
    w: boolean
    s: boolean
    ArrowUp: boolean
    ArrowDown: boolean
}

// ─── Types de remapping ───────────────────────────────────────────────────────

export type PlayerControls = {
    up: string   // ex: 'W', 'ArrowUp', 'Z'...
    down: string
}

export type ControlsConfig = {
    player1: PlayerControls
    player2: PlayerControls
}
