
// ─── Valeurs par défaut ───────────────────────────────────────────────────────

import type { ControlsConfig } from "../types/game.types"

export const DEFAULT_CONTROLS: ControlsConfig = {
    player1: { up: 'W', down: 'S' },
    player2: { up: 'ArrowUp', down: 'ArrowDown' },
}

const STORAGE_KEY = 'pong-controls'

// ─── Persistance localStorage ─────────────────────────────────────────────────

export function loadControls(): ControlsConfig {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return { ...DEFAULT_CONTROLS }
        const parsed = JSON.parse(raw) as ControlsConfig
        // Valide la structure minimale
        if (
            parsed?.player1?.up && parsed?.player1?.down &&
            parsed?.player2?.up && parsed?.player2?.down
        ) {
            return parsed
        }
    } catch { /* corrompu */ }
    return { ...DEFAULT_CONTROLS }
}

export function saveControls(config: ControlsConfig): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch { /* silencieux */ }
}

export function resetControls(): ControlsConfig {
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* silencieux */ }
    return { ...DEFAULT_CONTROLS }
}

// ─── Affichage lisible d'une touche ──────────────────────────────────────────

export function displayKey(key: string): string {
    const MAP: Record<string, string> = {
        ArrowUp: '↑',
        ArrowDown: '↓',
        ArrowLeft: '←',
        ArrowRight: '→',
        ' ': 'Espace',
        Enter: 'Entrée',
        Shift: 'Shift',
        Control: 'Ctrl',
        Alt: 'Alt',
        Escape: 'Echap',
    }
    return MAP[key] ?? key.toUpperCase()
}

// ─── Touches interdites (réservées système) ───────────────────────────────────

export const FORBIDDEN_KEYS = new Set([
    'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    'Tab', 'CapsLock', 'Meta', 'ContextMenu',
])