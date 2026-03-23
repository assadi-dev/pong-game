import type { KeysPressed } from '../types/game.types'

type Direction = -1 | 0 | 1

/**
 * Retourne la direction verticale du joueur gauche (touches W / S)
 */
export function directionLeft(keys: KeysPressed): Direction {
    if (keys.w && !keys.s) return -1
    if (keys.s && !keys.w) return 1
    return 0
}

/**
 * Retourne la direction verticale du joueur droit (flèches haut / bas)
 */
export function directionRight(keys: KeysPressed): Direction {
    if (keys.ArrowUp && !keys.ArrowDown) return -1
    if (keys.ArrowDown && !keys.ArrowUp) return 1
    return 0
}