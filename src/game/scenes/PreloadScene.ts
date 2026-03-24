import Phaser from 'phaser'
import { EventBus } from '../EventBus'

/**
 * PreloadScene — charge tous les assets avant le jeu.
 * La barre de chargement est gérée côté React via EventBus.
 */
export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' })
    }

    preload() {
        // Musique de fond
        this.load.audio('music', '/music.mp3')

        // Sons synthétiques en Phase 7 — pour l'instant on garde useAudio
        // this.load.audio('paddle-hit', '/sounds/paddle.wav')
        // this.load.audio('wall-hit',   '/sounds/wall.wav')
        // this.load.audio('score',      '/sounds/score.wav')
        // this.load.audio('win',        '/sounds/win.wav')

        // Progression du chargement vers React
        this.load.on('progress', (value: number) => {
            EventBus.emit('load-progress', value)
        })
    }

    create() {
        EventBus.emit('load-complete')
        this.scene.start('GameScene')
    }
}