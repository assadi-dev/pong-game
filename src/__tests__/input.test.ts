import { describe, it, expect } from 'vitest'
import type { KeysPressed } from '../types/game.types'
import { directionLeft, directionRight } from '../utils/input'

const noKeys: KeysPressed = { w: false, s: false, ArrowUp: false, ArrowDown: false }

describe('directionLeft', () => {
    it('retourne -1 quand W est pressé', () => {
        expect(directionLeft({ ...noKeys, w: true })).toBe(-1)
    })

    it('retourne 1 quand S est pressé', () => {
        expect(directionLeft({ ...noKeys, s: true })).toBe(1)
    })

    it('retourne 0 quand aucune touche', () => {
        expect(directionLeft(noKeys)).toBe(0)
    })

    it('retourne 0 quand W et S sont pressés simultanément', () => {
        expect(directionLeft({ ...noKeys, w: true, s: true })).toBe(0)
    })
})

describe('directionRight', () => {
    it('retourne -1 quand ArrowUp est pressé', () => {
        expect(directionRight({ ...noKeys, ArrowUp: true })).toBe(-1)
    })

    it('retourne 1 quand ArrowDown est pressé', () => {
        expect(directionRight({ ...noKeys, ArrowDown: true })).toBe(1)
    })

    it('retourne 0 quand aucune touche', () => {
        expect(directionRight(noKeys)).toBe(0)
    })

    it('retourne 0 quand les deux flèches sont pressées simultanément', () => {
        expect(directionRight({ ...noKeys, ArrowUp: true, ArrowDown: true })).toBe(0)
    })
})