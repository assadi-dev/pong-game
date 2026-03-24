import Phaser from 'phaser'
import { EventBus } from '../EventBus'

/**
 * BootScene — première scène lancée.
 * Charge les assets légers, puis passe à PreloadScene.
 */
export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        // Chargement minimal — la musique et sons lourds sont dans PreloadScene
    }

    create() {
        EventBus.emit('scene-ready', this)
        this.scene.start('PreloadScene')
    }
}