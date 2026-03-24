import Phaser from 'phaser'
import { EventBus } from '../EventBus'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../utils/constants'

/**
 * GameScene — scène principale du jeu.
 * Phase 1 : squelette vide qui confirme que Phaser tourne.
 * Les entités (balle, raquettes) arrivent en Phase 3.
 */
export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' })
    }

    create() {
        // Fond noir
        this.cameras.main.setBackgroundColor('#0a0a0a')

        // Ligne centrale pointillée (Graphics Phaser)
        const graphics = this.add.graphics()
        graphics.lineStyle(2, 0xffffff, 0.1)
        for (let y = 0; y < CANVAS_HEIGHT; y += 22) {
            graphics.lineBetween(CANVAS_WIDTH / 2, y, CANVAS_WIDTH / 2, y + 12)
        }

        // Cercle central
        graphics.lineStyle(1.5, 0xffffff, 0.06)
        graphics.strokeCircle(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 60)

        // Signale à React que la scène est prête
        EventBus.emit('scene-ready', this)

        // Texte de confirmation Phase 1 (sera retiré en Phase 3)
        this.add.text(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'Phaser OK', {
            fontFamily: 'monospace',
            fontSize: '20px',
            color: 'rgba(255,255,255,0.2)',
        }).setOrigin(0.5)
    }

    update() {
        // La boucle de jeu arrive en Phase 3
    }
}