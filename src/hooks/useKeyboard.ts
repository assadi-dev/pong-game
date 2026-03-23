import { useEffect, useRef } from 'react'
import type { KeysPressed } from '../types/game.types'

const DEFAULT_KEYS: KeysPressed = {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
}

/**
 * Suit l'état des touches clavier en temps réel.
 * Retourne un ref (pas un state) pour éviter les re-renders à chaque frame.
 */
export function useKeyboard(): React.RefObject<KeysPressed> {
    const keysRef = useRef<KeysPressed>({ ...DEFAULT_KEYS })

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key in keysRef.current) {
                e.preventDefault() // empêche le scroll avec les flèches
                keysRef.current = { ...keysRef.current, [e.key]: true }
            }
        }

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key in keysRef.current) {
                keysRef.current = { ...keysRef.current, [e.key]: false }
            }
        }

        window.addEventListener('keydown', onKeyDown)
        window.addEventListener('keyup', onKeyUp)

        return () => {
            window.removeEventListener('keydown', onKeyDown)
            window.removeEventListener('keyup', onKeyUp)
        }
    }, [])

    return keysRef
}