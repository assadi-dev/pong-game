import { useRef, useCallback } from 'react'

type SoundName = 'paddle' | 'wall' | 'score' | 'win'

/**
 * Génère tous les sons via Web Audio API (oscillateurs synthétiques).
 * Aucun fichier audio requis.
 */
export function useAudio() {
    const ctxRef = useRef<AudioContext | null>(null)

    const getCtx = useCallback((): AudioContext => {
        if (!ctxRef.current) {
            ctxRef.current = new AudioContext()
        }
        // Reprend le contexte si suspendu (politique autoplay navigateurs)
        if (ctxRef.current.state === 'suspended') {
            ctxRef.current.resume()
        }
        return ctxRef.current
    }, [])

    const play = useCallback((sound: SoundName) => {
        try {
            const ctx = getCtx()

            switch (sound) {
                case 'paddle': playPaddle(ctx); break
                case 'wall': playWall(ctx); break
                case 'score': playScore(ctx); break
                case 'win': playWin(ctx); break
            }
        } catch {
            // Silencieux si Web Audio non disponible
        }
    }, [getCtx])

    return { play }
}

// ─── Sons synthétiques ────────────────────────────────────────────────────────

/** Clic sec — rebond sur raquette */
function playPaddle(ctx: AudioContext) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'square'
    osc.frequency.setValueAtTime(480, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.06)

    gain.gain.setValueAtTime(0.18, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
}

/** Clic plus aigu — rebond sur mur */
function playWall(ctx: AudioContext) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'square'
    osc.frequency.setValueAtTime(320, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.05)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.06)
}

/** Bip descendant — point marqué */
function playScore(ctx: AudioContext) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.35)

    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.4)
}

/** Fanfare courte — victoire */
function playWin(ctx: AudioContext) {
    const notes = [523, 659, 784, 1047] // Do Mi Sol Do

    notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.connect(gain)
        gain.connect(ctx.destination)

        const t = ctx.currentTime + i * 0.12

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t)

        gain.gain.setValueAtTime(0.0, t)
        gain.gain.linearRampToValueAtTime(0.22, t + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)

        osc.start(t)
        osc.stop(t + 0.2)
    })
}