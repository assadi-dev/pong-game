import { useRef, useEffect, useCallback, useState } from 'react'

const DEFAULT_VOLUME = 0.45

export function useMusic() {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const gainRef = useRef<GainNode | null>(null)
    const ctxRef = useRef<AudioContext | null>(null)
    const fadeRef = useRef<number>(0)

    const [volume, setVolumeState] = useState(DEFAULT_VOLUME)
    const [muted, setMutedState] = useState(false)

    // Initialisation au premier interact utilisateur
    const init = useCallback(() => {
        if (ctxRef.current) return

        const audio = new Audio('/music.mp3')
        audio.loop = true
        audioRef.current = audio

        const ctx = new AudioContext()
        const src = ctx.createMediaElementSource(audio)
        const gain = ctx.createGain()

        gain.gain.value = DEFAULT_VOLUME
        src.connect(gain)
        gain.connect(ctx.destination)

        ctxRef.current = ctx
        gainRef.current = gain

        audio.play().catch(() => {/* autoplay bloqué — l'utilisateur devra interagir */ })
    }, [])

    // Jouer / reprendre
    const play = useCallback(() => {
        init()
        cancelAnimationFrame(fadeRef.current)
        if (gainRef.current) gainRef.current.gain.value = muted ? 0 : volume
        audioRef.current?.play().catch(() => { })
    }, [init, muted, volume])

    // Pause
    const pause = useCallback(() => {
        audioRef.current?.pause()
    }, [])

    // Changer le volume
    const setVolume = useCallback((v: number) => {
        const clamped = Math.max(0, Math.min(1, v))
        setVolumeState(clamped)
        if (gainRef.current && !muted) gainRef.current.gain.value = clamped
    }, [muted])

    // Mute / unmute
    const toggleMute = useCallback(() => {
        setMutedState(prev => {
            const next = !prev
            if (gainRef.current) gainRef.current.gain.value = next ? 0 : volume
            return next
        })
    }, [volume])

    // Fade out (fin de partie)
    const fadeOut = useCallback((durationMs = 1500) => {
        const gain = gainRef.current
        if (!gain) return

        const start = performance.now()
        const startGain = gain.gain.value

        cancelAnimationFrame(fadeRef.current)

        const step = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / durationMs, 1)
            gain.gain.value = startGain * (1 - progress)
            if (progress < 1) {
                fadeRef.current = requestAnimationFrame(step)
            }
        }
        fadeRef.current = requestAnimationFrame(step)
    }, [])

    // Fade in (reprise après gameover/pause)
    const fadeIn = useCallback((durationMs = 800) => {
        const gain = gainRef.current
        if (!gain || muted) return

        const start = performance.now()
        const target = volume

        cancelAnimationFrame(fadeRef.current)
        gain.gain.value = 0

        const step = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / durationMs, 1)
            gain.gain.value = target * progress
            if (progress < 1) {
                fadeRef.current = requestAnimationFrame(step)
            }
        }
        fadeRef.current = requestAnimationFrame(step)
    }, [muted, volume])

    // Nettoyage
    useEffect(() => {
        return () => {
            cancelAnimationFrame(fadeRef.current)
            audioRef.current?.pause()
            ctxRef.current?.close()
        }
    }, [])

    return { play, pause, fadeOut, fadeIn, setVolume, toggleMute, volume, muted, init }
}