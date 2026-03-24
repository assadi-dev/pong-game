import Phaser from 'phaser'
import { PADDLE_WIDTH, PADDLE_HEIGHT, BALL_SIZE } from '../utils/constants'

/**
 * Génère toutes les textures du jeu par code via Graphics.
 * Appelé dans PreloadScene avant le démarrage de GameScene.
 */
export function generateTextures(scene: Phaser.Scene) {
    generatePaddleTexture(scene)
    generateBallTexture(scene)
}

function generatePaddleTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('paddle')) return

    const g = scene.make.graphics({ x: 0, y: 0 })

    // Corps principal
    g.fillStyle(0xffffff, 1)
    g.fillRoundedRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT, 4)

    // Reflet central subtil
    g.fillStyle(0xffffff, 0.15)
    g.fillRoundedRect(
        PADDLE_WIDTH * 0.2,
        PADDLE_HEIGHT * 0.1,
        PADDLE_WIDTH * 0.6,
        PADDLE_HEIGHT * 0.8,
        2,
    )

    g.generateTexture('paddle', PADDLE_WIDTH, PADDLE_HEIGHT)
    g.destroy()
}

function generateBallTexture(scene: Phaser.Scene) {
    if (scene.textures.exists('ball')) return

    const g = scene.make.graphics({ x: 0, y: 0 })

    g.fillStyle(0xffffff, 1)
    g.fillRect(0, 0, BALL_SIZE, BALL_SIZE)

    g.generateTexture('ball', BALL_SIZE, BALL_SIZE)
    g.destroy()
}