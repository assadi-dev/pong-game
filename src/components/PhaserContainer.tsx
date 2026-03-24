import { useEffect, useRef } from 'react'
import type Phaser from 'phaser'
import { createPhaserGame } from '../game/PhaserGame'
import { EventBus } from '../game/EventBus'

type PhaserContainerProps = {
    onSceneReady?: (scene: Phaser.Scene) => void
}

/**
 * PhaserContainer — wrapper React qui monte le jeu Phaser dans un div.
 *
 * Phaser injecte son canvas dans `containerRef.current`.
 * React superpose ses composants UI (HUD, menus) par-dessus via position:absolute.
 */
export function PhaserContainer({ onSceneReady }: PhaserContainerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<Phaser.Game | null>(null)

    useEffect(() => {
        if (!containerRef.current || gameRef.current) return

        // Crée l'instance Phaser et l'injecte dans le div
        gameRef.current = createPhaserGame(containerRef.current)

        // Écoute la scène prête
        const onReady = (scene: Phaser.Scene) => {
            onSceneReady?.(scene)
        }
        EventBus.on('scene-ready', onReady)

        // Nettoyage au démontage du composant
        return () => {
            EventBus.off('scene-ready', onReady)
            gameRef.current?.destroy(true)
            gameRef.current = null
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div
            ref={containerRef}
            style={{
                display: 'inline-block',
                position: 'relative',
                lineHeight: 0,           // évite l'espace sous le canvas inline
            }}
        />
    )
}