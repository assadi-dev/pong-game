import Phaser from 'phaser'
import { EventBus } from '../EventBus'
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_MARGIN,
    BALL_SIZE,
} from '../../utils/constants'
import type { GamePhase, GameMode, Difficulty } from '../../types/game.types'

// ─── Types internes ───────────────────────────────────────────────────────────

export type SceneState = {
    phase: GamePhase
    scoreLeft: number
    scoreRight: number
    winner: 'left' | 'right' | null
    gameMode: GameMode
    difficulty: Difficulty
}

// ─── GameScene ────────────────────────────────────────────────────────────────

export class GameScene extends Phaser.Scene {

    // Entités visuelles
    protected paddleLeft!: Phaser.GameObjects.Rectangle
    protected paddleRight!: Phaser.GameObjects.Rectangle
    protected ball!: Phaser.GameObjects.Rectangle
    protected courtGfx!: Phaser.GameObjects.Graphics

    // État interne
    protected state: SceneState = {
        phase: 'menu',
        scoreLeft: 0,
        scoreRight: 0,
        winner: null,
        gameMode: 'pvp',
        difficulty: 'medium',
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    // ── create ──────────────────────────────────────────────────────────────────

    create() {
        this.cameras.main.setBackgroundColor('#0a0a0a')

        this.createCourt()
        this.createPaddles()
        this.createBall()

        // Signale à React que la scène est prête
        EventBus.emit('scene-ready', this)

        // Écoute les commandes depuis React
        EventBus.on('cmd-start', this.onStart, this)
        EventBus.on('cmd-pause', this.onPause, this)
        EventBus.on('cmd-resume', this.onResume, this)
        EventBus.on('cmd-reset', this.onReset, this)
        EventBus.on('cmd-set-mode', this.onSetMode, this)
    }

    // ── Terrain ──────────────────────────────────────────────────────────────────

    private createCourt() {
        this.courtGfx = this.add.graphics()
        const g = this.courtGfx

        // Ligne centrale pointillée
        g.lineStyle(2, 0xffffff, 0.1)
        for (let y = 0; y < CANVAS_HEIGHT; y += 22) {
            g.lineBetween(CANVAS_WIDTH / 2, y, CANVAS_WIDTH / 2, y + 12)
        }

        // Cercle central
        g.lineStyle(1.5, 0xffffff, 0.06)
        g.strokeCircle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 60)
    }

    // ── Entités ──────────────────────────────────────────────────────────────────

    private createPaddles() {
        const cy = CANVAS_HEIGHT / 2

        this.paddleLeft = this.add.rectangle(
            PADDLE_MARGIN + PADDLE_WIDTH / 2,
            cy,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            0xffffff,
        )

        this.paddleRight = this.add.rectangle(
            CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH / 2,
            cy,
            PADDLE_WIDTH,
            PADDLE_HEIGHT,
            0xffffff,
        )
    }

    private createBall() {
        this.ball = this.add.rectangle(
            CANVAS_WIDTH / 2,
            CANVAS_HEIGHT / 2,
            BALL_SIZE,
            BALL_SIZE,
            0xffffff,
        )
    }

    // ── Commandes React → Phaser ─────────────────────────────────────────────────

    protected onStart(payload: { gameMode: GameMode; difficulty: Difficulty }) {
        this.state = {
            ...this.state,
            phase: 'playing',
            scoreLeft: 0,
            scoreRight: 0,
            winner: null,
            gameMode: payload.gameMode,
            difficulty: payload.difficulty,
        }
        this.emitState()
    }

    protected onPause() {
        if (this.state.phase === 'playing') {
            this.state = { ...this.state, phase: 'paused' }
            this.emitState()
        }
    }

    protected onResume() {
        if (this.state.phase === 'paused') {
            this.state = { ...this.state, phase: 'playing' }
            this.emitState()
        }
    }

    protected onReset() {
        this.state = {
            phase: 'menu',
            scoreLeft: 0,
            scoreRight: 0,
            winner: null,
            gameMode: 'pvp',
            difficulty: 'medium',
        }
        this.resetPositions()
        this.emitState()
    }

    protected onSetMode(payload: { gameMode: GameMode; difficulty: Difficulty }) {
        this.state = { ...this.state, ...payload }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    protected resetPositions() {
        this.paddleLeft.y = CANVAS_HEIGHT / 2
        this.paddleRight.y = CANVAS_HEIGHT / 2
        this.ball.x = CANVAS_WIDTH / 2
        this.ball.y = CANVAS_HEIGHT / 2
    }

    protected emitState() {
        EventBus.emit('state-update', { ...this.state })
    }

    // ── update ───────────────────────────────────────────────────────────────────

    update(_time: number, _delta: number) {
        // Physique & inputs en Phase 3 & 5
    }

    // ── Nettoyage ─────────────────────────────────────────────────────────────────

    shutdown() {
        EventBus.off('cmd-start', this.onStart, this)
        EventBus.off('cmd-pause', this.onPause, this)
        EventBus.off('cmd-resume', this.onResume, this)
        EventBus.off('cmd-reset', this.onReset, this)
        EventBus.off('cmd-set-mode', this.onSetMode, this)
    }
}