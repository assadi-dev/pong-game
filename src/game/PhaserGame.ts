import Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { PreloadScene } from './scenes/PreloadScene'
import { GameScene } from './scenes/GameScene'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/constants'

export function createPhaserGame(parent: HTMLElement): Phaser.Game {
    return new Phaser.Game({
        type: Phaser.AUTO,          // WebGL si dispo, Canvas 2D sinon
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        parent,
        backgroundColor: '#0a0a0a',
        scene: [BootScene, PreloadScene, GameScene],

        physics: {
            default: 'arcade',
            arcade: {
                gravity: { x: 0, y: 0 }, // zéro gravité — c'est du Pong
                debug: false,           // passer à true pour visualiser les hitboxes
            },
        },

        audio: {
            disableWebAudio: false,
        },

        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },

        // Phaser ne doit PAS créer son propre canvas — on lui donne le parent
        // et il injecte le canvas dans ce div
        render: {
            antialias: true,
            pixelArt: false,
            roundPixels: false,
        },
    })
}