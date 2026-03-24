import Phaser from 'phaser'
import { CANVAS_WIDTH, CANVAS_HEIGHT, BALL_SIZE } from '../utils/constants'

/**
 * EffectsManager — gère tous les effets visuels Phaser :
 * - Traînée de la balle via RenderTexture
 * - Flash de fond au rebond raquette
 * - Explosion de particules au point marqué
 * - Lueur (pipeline FX) sur les entités
 */
export class EffectsManager {
    private scene: Phaser.Scene
    private trail!: Phaser.GameObjects.RenderTexture
    private flash!: Phaser.GameObjects.Rectangle
    private emitter!: Phaser.GameObjects.Particles.ParticleEmitter

    constructor(scene: Phaser.Scene) {
        this.scene = scene
    }

    init(ball: Phaser.GameObjects.Rectangle) {
        this.createTrail()
        this.createFlash()
        this.createParticles()
        this.applyGlow(ball)
    }

    // ── Traînée ────────────────────────────────────────────────────────────────

    private createTrail() {
        // RenderTexture de la taille du canvas — on y dessine chaque frame
        this.trail = this.scene.add.renderTexture(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        this.trail.setDepth(-1) // derrière toutes les entités
    }

    updateTrail(ball: Phaser.GameObjects.Rectangle) {
        // Fondu progressif de la texture existante (efface les vieilles positions)
        this.trail.fill(0x0a0a0a, 0.35)

        // Dessine la balle actuelle dans la texture avec opacité réduite
        this.trail.draw(ball, ball.x, ball.y)
    }

    clearTrail() {
        this.trail.clear()
    }

    // ── Flash rebond ───────────────────────────────────────────────────────────

    private createFlash() {
        this.flash = this.scene.add.rectangle(
            CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2,
            CANVAS_WIDTH, CANVAS_HEIGHT,
            0xffffff, 0,
        )
        this.flash.setDepth(10)
    }

    playFlash(side: 'left' | 'right') {
        // Petit flash blanc du côté qui encaisse le rebond
        const x = side === 'left' ? CANVAS_WIDTH / 4 : (3 * CANVAS_WIDTH) / 4
        this.flash.setX(x)
        this.flash.setSize(CANVAS_WIDTH / 2, CANVAS_HEIGHT)

        this.scene.tweens.add({
            targets: this.flash,
            alpha: { from: 0.06, to: 0 },
            duration: 80,
            ease: 'Cubic.easeOut',
        })
    }

    // ── Particules point ───────────────────────────────────────────────────────

    private createParticles() {
        // Texture carrée blanche 4×4 générée par code
        const g = this.scene.make.graphics({ x: 0, y: 0 })
        g.fillStyle(0xffffff, 1)
        g.fillRect(0, 0, 4, 4)
        g.generateTexture('particle', 4, 4)
        g.destroy()

        this.emitter = this.scene.add.particles(0, 0, 'particle', {
            speed: { min: 80, max: 240 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.9, end: 0 },
            lifespan: { min: 300, max: 600 },
            quantity: 0,   // on émet manuellement
            gravityY: 80,
        })
        this.emitter.setDepth(20)
    }

    playScoreExplosion(x: number, y: number) {
        this.emitter.setPosition(x, y)
        this.emitter.explode(30)
    }

    // ── Lueur entités ──────────────────────────────────────────────────────────

    private applyGlow(ball: Phaser.GameObjects.Rectangle) {
        // FX pipeline disponible en WebGL uniquement
        if (this.scene.renderer.type !== Phaser.WEBGL) return

        try {
            // @ts-expect-error — postFX disponible en WebGL
            ball.postFX?.addGlow(0xffffff, 4, 0, false, 0.1, 8)
        } catch {
            // Silencieux si le pipeline n'est pas disponible
        }
    }

    applyPaddleGlow(paddle: Phaser.GameObjects.Rectangle) {
        if (this.scene.renderer.type !== Phaser.WEBGL) return
        try {
            // @ts-expect-error
            paddle.postFX?.addGlow(0xffffff, 3, 0, false, 0.1, 6)
        } catch { /* silencieux */ }
    }
}