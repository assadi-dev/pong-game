import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGameLoop } from '../hooks/useGameloop'


describe('useGameLoop', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        let frame = 0
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            frame++
            // Simule un timestamp croissant (16ms par frame ~60fps)
            setTimeout(() => cb(frame * 16), 16)
            return frame
        })
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { })
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it('appelle le callback quand running=true', async () => {
        const callback = vi.fn()
        renderHook(() => useGameLoop(callback, true))

        await act(async () => {
            vi.advanceTimersByTime(50)
        })

        expect(callback).toHaveBeenCalled()
    })

    it('ne appelle pas le callback quand running=false', async () => {
        const callback = vi.fn()
        renderHook(() => useGameLoop(callback, false))

        await act(async () => {
            vi.advanceTimersByTime(50)
        })

        expect(callback).not.toHaveBeenCalled()
    })

    it('passe un deltaTime positif au callback', async () => {
        let receivedDelta = 0
        renderHook(() => useGameLoop((dt) => { receivedDelta = dt }, true))

        await act(async () => {
            vi.advanceTimersByTime(50)
        })

        expect(receivedDelta).toBeGreaterThan(0)
        expect(receivedDelta).toBeLessThanOrEqual(0.1) // plafonné à 100ms
    })
})