import { useEffect, useRef, useCallback } from 'react'

type LoopCallback = (deltaTime: number) => void

export function useGameLoop(callback: LoopCallback, running: boolean) {
    const callbackRef = useRef<LoopCallback>(callback)
    const rafRef = useRef<number>(0)
    const lastTimeRef = useRef<number>(0)

    // Toujours garder la dernière version du callback
    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    const loop = useCallback((timestamp: number) => {
        if (lastTimeRef.current === 0) {
            lastTimeRef.current = timestamp
        }

        // deltaTime en secondes, plafonné à 100ms pour éviter les sauts
        const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1)
        lastTimeRef.current = timestamp

        callbackRef.current(deltaTime)

        rafRef.current = requestAnimationFrame(loop)
    }, [])

    useEffect(() => {
        if (!running) {
            cancelAnimationFrame(rafRef.current)
            lastTimeRef.current = 0
            return
        }

        rafRef.current = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(rafRef.current)
            lastTimeRef.current = 0
        }
    }, [running, loop])
}