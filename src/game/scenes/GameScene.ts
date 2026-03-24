import Phaser from 'phaser'
import { EventBus } from '../EventBus'
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    PADDLE_WIDTH,
    PADDLE_HEIGHT,
    PADDLE_MARGIN,
    PADDLE_SPEED,
    BALL_SIZE,
    BALL_SPEED_INIT,
    BALL_SPEED_MAX,
    BALL_SPEED_INC,
    WINNING_SCORE,
} from '../../utils/constants'
import { computeAIDirection } from '../../utils/ai'
import { EffectsManager } from '../EffectsManager'
import type { GamePhase, GameMode, Difficulty } from '../../types/game.types'

// ─── Types internes ────────────────────────────────────────────────────────────

export type SceneState = {
    phase: GamePhase
    scoreLeft: number
    scoreRight: number
    winner: 'left' | 'right' | null
    gameMode: GameMode
    difficulty: Difficulty
}

const SCORED_FREEZE_MS = 1000

// ─── GameScene ─────────────────────────────────────────────────────────────────

export class GameScene extends Phaser.Scene {

    // ── Corps physiques ──────────────────────────────────────────────────────────
    protected paddleLeftBody!: Phaser.Physics.Arcade.Body
    protected paddleRightBody!: Phaser.Physics.Arcade.Body
    protected ballBody!: Phaser.Physics.Arcade.Body

    // ── GameObjects visuels ──────────────────────────────────────────────────────
    protected paddleLeftGO!: Phaser.GameObjects.Rectangle
    protected paddleRightGO!: Phaser.GameObjects.Rectangle
    protected ballGO!: Phaser.GameObjects.Rectangle
    protected courtGfx!: Phaser.GameObjects.Graphics

    // ── Inputs ───────────────────────────────────────────────────────────────────
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private wasd!: Record<string, Phaser.Input.Keyboard.Key>

    // ── État ─────────────────────────────────────────────────────────────────────
    protected state: SceneState = {
        phase: 'menu',
        scoreLeft: 0,
        scoreRight: 0,
        winner: null,
        gameMode: 'pvp',
        difficulty: 'medium',
    }

    private scoredTimer = 0
    private effects!: EffectsManager

    constructor() {
        super({ key: 'GameScene' })
    }

    // ── create ───────────────────────────────────────────────────────────────────

    create() {
        this.cameras.main.setBackgroundColor('#0a0a0a')

        this.createCourt()
        this.createPaddles()
        this.createBall()
        this.setupCollisions()
        this.setupInputs()

        // Effets visuels
        this.effects = new EffectsManager(this)
        this.effects.init(this.ballGO)
        this.effects.applyPaddleGlow(this.paddleLeftGO)
        this.effects.applyPaddleGlow(this.paddleRightGO)

        EventBus.emit('scene-ready', this)

        EventBus.on('cmd-start', this.onStart, this)
        EventBus.on('cmd-pause', this.onPause, this)
        EventBus.on('cmd-resume', this.onResume, this)
        EventBus.on('cmd-reset', this.onReset, this)
        EventBus.on('cmd-set-mode', this.onSetMode, this)
    }

    // ── Terrain ───────────────────────────────────────────────────────────────────

    private createCourt() {
        this.courtGfx = this.add.graphics()
        const g = this.courtGfx

        g.lineStyle(2, 0xffffff, 0.1)
        for (let y = 0; y < CANVAS_HEIGHT; y += 22) {
            g.lineBetween(CANVAS_WIDTH / 2, y, CANVAS_WIDTH / 2, y + 12)
        }
        g.lineStyle(1.5, 0xffffff, 0.06)
        g.strokeCircle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 60)
    }

    // ── Entités physiques ─────────────────────────────────────────────────────────

    private createPaddles() {
        const cy = CANVAS_HEIGHT / 2

        // Raquette gauche
        this.paddleLeftGO = this.add.rectangle(
            PADDLE_MARGIN + PADDLE_WIDTH / 2, cy,
            PADDLE_WIDTH, PADDLE_HEIGHT, 0xffffff,
        )
        this.physics.add.existing(this.paddleLeftGO, false)
        this.paddleLeftBody = this.paddleLeftGO.body as Phaser.Physics.Arcade.Body
        this.paddleLeftBody.setImmovable(true)
        this.paddleLeftBody.setCollideWorldBounds(true)
        this.paddleLeftBody.setMaxVelocityY(PADDLE_SPEED)

        // Raquette droite
        this.paddleRightGO = this.add.rectangle(
            CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH / 2, cy,
            PADDLE_WIDTH, PADDLE_HEIGHT, 0xffffff,
        )
        this.physics.add.existing(this.paddleRightGO, false)
        this.paddleRightBody = this.paddleRightGO.body as Phaser.Physics.Arcade.Body
        this.paddleRightBody.setImmovable(true)
        this.paddleRightBody.setCollideWorldBounds(true)
        this.paddleRightBody.setMaxVelocityY(PADDLE_SPEED)
    }

    private createBall() {
        this.ballGO = this.add.rectangle(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
            BALL_SIZE, BALL_SIZE, 0xffffff,
        )
        this.physics.add.existing(this.ballGO, false)
        this.ballBody = this.ballGO.body as Phaser.Physics.Arcade.Body

        // Rebond sur les murs haut et bas uniquement
        this.ballBody.setCollideWorldBounds(true)
        this.ballBody.setBounce(1, 1)

        // Empêche Phaser de faire sortir la balle par les côtés
        // (on gère ça manuellement pour détecter les points)
        this.physics.world.setBoundsCollision(false, false, true, true)
    }

    // ── Collisions balle / raquettes ──────────────────────────────────────────────

    private setupCollisions() {
        this.physics.add.collider(
            this.ballGO,
            this.paddleLeftGO,
            this.onBallHitPaddleLeft as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this,
        )
        this.physics.add.collider(
            this.ballGO,
            this.paddleRightGO,
            this.onBallHitPaddleRight as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this,
        )
    }

    private onBallHitPaddleLeft() {
        const relHit = (this.ballGO.y - this.paddleLeftGO.y) / (PADDLE_HEIGHT / 2)
        const angle = relHit * (35 * Math.PI / 180)
        const speed = Math.min(
            Math.sqrt(this.ballBody.velocity.x ** 2 + this.ballBody.velocity.y ** 2) + BALL_SPEED_INC,
            BALL_SPEED_MAX,
        )
        this.ballBody.setVelocity(
            Math.cos(angle) * speed,        // toujours vers la droite
            Math.sin(angle) * speed,
        )
        // Repositionne hors de la raquette
        this.ballGO.x = this.paddleLeftGO.x + PADDLE_WIDTH / 2 + BALL_SIZE / 2 + 1
        this.effects.playFlash('right')
        this.tweens.add({
            targets: this.paddleLeftGO,
            scaleX: { from: 1.3, to: 1 },
            duration: 120,
            ease: 'Back.easeOut',
        })
        EventBus.emit('sfx-paddle')
    }

    private onBallHitPaddleRight() {
        const relHit = (this.ballGO.y - this.paddleRightGO.y) / (PADDLE_HEIGHT / 2)
        const angle = relHit * (35 * Math.PI / 180)
        const speed = Math.min(
            Math.sqrt(this.ballBody.velocity.x ** 2 + this.ballBody.velocity.y ** 2) + BALL_SPEED_INC,
            BALL_SPEED_MAX,
        )
        this.ballBody.setVelocity(
            -Math.cos(angle) * speed,       // toujours vers la gauche
            Math.sin(angle) * speed,
        )
        this.ballGO.x = this.paddleRightGO.x - PADDLE_WIDTH / 2 - BALL_SIZE / 2 - 1
        this.effects.playFlash('left')
        this.tweens.add({
            targets: this.paddleRightGO,
            scaleX: { from: 1.3, to: 1 },
            duration: 120,
            ease: 'Back.easeOut',
        })
        EventBus.emit('sfx-paddle')
    }

    // ── Inputs ────────────────────────────────────────────────────────────────────

    private setupInputs() {
        this.cursors = this.input.keyboard!.createCursorKeys()
        this.wasd = this.input.keyboard!.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
        }) as Record<string, Phaser.Input.Keyboard.Key>
    }

    // ── Lancer la balle ───────────────────────────────────────────────────────────

    protected launchBall() {
        const angle = (Math.random() * 30 + 30) * (Math.PI / 180)
        const dirX = Math.random() > 0.5 ? 1 : -1
        const dirY = Math.random() > 0.5 ? 1 : -1
        this.ballGO.setPosition(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        this.ballBody.setVelocity(
            Math.cos(angle) * BALL_SPEED_INIT * dirX,
            Math.sin(angle) * BALL_SPEED_INIT * dirY,
        )
    }

    // ── Commandes React → Phaser ──────────────────────────────────────────────────

    protected onStart(payload: { gameMode: GameMode; difficulty: Difficulty }) {
        this.state = {
            phase: 'playing', scoreLeft: 0, scoreRight: 0,
            winner: null, gameMode: payload.gameMode, difficulty: payload.difficulty,
        }
        this.resetPositions()
        this.launchBall()
        this.emitState()
    }

    protected onPause() {
        if (this.state.phase !== 'playing') return
        this.ballBody.setVelocity(0, 0)
        this.state = { ...this.state, phase: 'paused' }
        this.emitState()
    }

    protected onResume() {
        if (this.state.phase !== 'paused') return
        this.launchBall()
        this.state = { ...this.state, phase: 'playing' }
        this.emitState()
    }

    protected onReset() {
        this.ballBody.setVelocity(0, 0)
        this.state = {
            phase: 'menu', scoreLeft: 0, scoreRight: 0,
            winner: null, gameMode: 'pvp', difficulty: 'medium',
        }
        this.resetPositions()
        this.emitState()
    }

    protected onSetMode(payload: { gameMode: GameMode; difficulty: Difficulty }) {
        this.state = { ...this.state, ...payload }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────────

    protected resetPositions() {
        this.paddleLeftGO.y = CANVAS_HEIGHT / 2
        this.paddleRightGO.y = CANVAS_HEIGHT / 2
        this.ballGO.setPosition(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)
        this.paddleLeftBody.reset(PADDLE_MARGIN + PADDLE_WIDTH / 2, CANVAS_HEIGHT / 2)
        this.paddleRightBody.reset(CANVAS_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH / 2, CANVAS_HEIGHT / 2)
    }

    protected emitState() {
        EventBus.emit('state-update', { ...this.state })
    }

    // ── Détection point ───────────────────────────────────────────────────────────

    private checkPoint(): 'left' | 'right' | null {
        if (this.ballGO.x < 0) return 'right'
        if (this.ballGO.x > CANVAS_WIDTH) return 'left'
        return null
    }

    private handlePoint(scorer: 'left' | 'right') {
        if (scorer === 'left') this.state.scoreLeft++
        else this.state.scoreRight++

        EventBus.emit('sfx-score')
        this.effects.playScoreExplosion(this.ballGO.x, this.ballGO.y)
        this.effects.clearTrail()
        this.ballBody.setVelocity(0, 0)
        this.ballGO.setPosition(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2)

        const won = this.state.scoreLeft >= WINNING_SCORE
            || this.state.scoreRight >= WINNING_SCORE

        if (won) {
            this.state = {
                ...this.state,
                phase: 'gameover',
                winner: this.state.scoreLeft >= WINNING_SCORE ? 'left' : 'right',
            }
            this.emitState()
            EventBus.emit('sfx-win')
            return
        }

        this.state = { ...this.state, phase: 'scored' }
        this.scoredTimer = 0
        this.emitState()
    }

    // ── update ────────────────────────────────────────────────────────────────────

    update(_time: number, delta: number) {
        if (this.state.phase === 'paused' || this.state.phase === 'menu' || this.state.phase === 'gameover') {
            this.paddleLeftBody.setVelocityY(0)
            this.paddleRightBody.setVelocityY(0)
            return
        }

        // Freeze post-point
        if (this.state.phase === 'scored') {
            this.scoredTimer += delta
            this.paddleLeftBody.setVelocityY(0)
            this.paddleRightBody.setVelocityY(0)
            if (this.scoredTimer >= SCORED_FREEZE_MS) {
                this.state = { ...this.state, phase: 'playing' }
                this.emitState()
                this.launchBall()
            }
            return
        }

        // ── Mouvement raquette gauche (W/S) ──────────────────────────────────────
        if (this.wasd['up'].isDown) {
            this.paddleLeftBody.setVelocityY(-PADDLE_SPEED)
        } else if (this.wasd['down'].isDown) {
            this.paddleLeftBody.setVelocityY(PADDLE_SPEED)
        } else {
            this.paddleLeftBody.setVelocityY(0)
        }

        // ── Raquette droite : joueur 2 ou IA ─────────────────────────────────────
        if (this.state.gameMode === 'pvp') {
            if (this.cursors.up.isDown) {
                this.paddleRightBody.setVelocityY(-PADDLE_SPEED)
            } else if (this.cursors.down.isDown) {
                this.paddleRightBody.setVelocityY(PADDLE_SPEED)
            } else {
                this.paddleRightBody.setVelocityY(0)
            }
        } else {
            // IA — on adapte l'interface pour computeAIDirection
            const fakePaddle = {
                position: { x: this.paddleRightGO.x, y: this.paddleRightGO.y - PADDLE_HEIGHT / 2 },
                width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: this.state.scoreRight,
            }
            const fakeBall = {
                position: { x: this.ballGO.x, y: this.ballGO.y },
                velocity: { x: this.ballBody.velocity.x, y: this.ballBody.velocity.y },
                size: BALL_SIZE,
            }
            const dir = computeAIDirection(fakePaddle, fakeBall, delta / 1000, this.state.difficulty)
            this.paddleRightBody.setVelocityY(dir * PADDLE_SPEED)
        }

        // ── Traînée balle
        this.effects.updateTrail(this.ballGO)

        // ── Rebond mur haut/bas — son ─────────────────────────────────────────────
        const vy = this.ballBody.velocity.y
        if (
            (this.ballGO.y <= BALL_SIZE / 2 && vy < 0) ||
            (this.ballGO.y >= CANVAS_HEIGHT - BALL_SIZE / 2 && vy > 0)
        ) {
            EventBus.emit('sfx-wall')
        }

        // ── Détection point ───────────────────────────────────────────────────────
        const scorer = this.checkPoint()
        if (scorer) this.handlePoint(scorer)
    }

    // ── Nettoyage ──────────────────────────────────────────────────────────────────

    shutdown() {
        EventBus.off('cmd-start', this.onStart, this)
        EventBus.off('cmd-pause', this.onPause, this)
        EventBus.off('cmd-resume', this.onResume, this)
        EventBus.off('cmd-reset', this.onReset, this)
        EventBus.off('cmd-set-mode', this.onSetMode, this)
    }
}