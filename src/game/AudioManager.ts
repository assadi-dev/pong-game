import Phaser from 'phaser'

type SoundName = 'paddle' | 'wall' | 'score' | 'win'

/**
 * AudioManager — génère tous les sons via Web Audio API
 * en passant par le contexte audio de Phaser.
 *
 * Avantages vs useAudio.ts :
 * - Partage le même AudioContext que Phaser
 * - Géré par le SoundManager (pause auto, volume global)
 * - Pas de drift entre sons et rendu
 */
export class AudioManager {
    private ctx: AudioContext
    private masterGain: GainNode
    private musicSource: Phaser.Sound.WebAudioSound | null = null
    private musicVolume = 0.45
    private muted = false

    constructor(scene: Phaser.Scene) {
        // Récupère le contexte audio de Phaser
        const webAudio = scene.sound as Phaser.Sound.WebAudioSoundManager
        this.ctx = webAudio.context

        // Gain master pour les SFX
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 1
        this.masterGain.connect(this.ctx.destination)
    }

    // ── Musique ────────────────────────────────────────────────────────────────

    initMusic(scene: Phaser.Scene) {
        if (!scene.cache.audio.exists('music')) return

        this.musicSource = scene.sound.add('music', {
            loop: true,
            volume: this.musicVolume,
        }) as Phaser.Sound.WebAudioSound
    }

    play() {
        if (!this.musicSource) return
        this.musicSource.seek = 0
        this.musicSource.setVolume(this.muted ? 0 : this.musicVolume)
        this.musicSource.play()
    }

    pauseMusic() {
        this.musicSource?.pause()
    }

    resumeMusic() {
        this.musicSource?.resume()
    }

    fadeIn(scene: Phaser.Scene, durationMs = 600) {
        if (!this.musicSource || this.muted) return
        this.musicSource.setVolume(0)
        scene.tweens.add({
            targets: this.musicSource,
            volume: this.musicVolume,
            duration: durationMs,
            ease: 'Linear',
        })
    }

    fadeOut(scene: Phaser.Scene, durationMs = 1500) {
        if (!this.musicSource) return
        scene.tweens.add({
            targets: this.musicSource,
            volume: 0,
            duration: durationMs,
            ease: 'Linear',
        })
    }

    setVolume(v: number) {
        this.musicVolume = Math.max(0, Math.min(1, v))
        if (!this.muted && this.musicSource) {
            this.musicSource.setVolume(this.musicVolume)
        }
    }

    toggleMute() {
        this.muted = !this.muted
        if (this.musicSource) {
            this.musicSource.setVolume(this.muted ? 0 : this.musicVolume)
        }
        return this.muted
    }

    getMuted() { return this.muted }
    getVolume() { return this.musicVolume }

    // ── SFX synthétiques ───────────────────────────────────────────────────────

    playSfx(name: SoundName) {
        try {
            switch (name) {
                case 'paddle': this.sfxPaddle(); break
                case 'wall': this.sfxWall(); break
                case 'score': this.sfxScore(); break
                case 'win': this.sfxWin(); break
            }
        } catch { /* silencieux */ }
    }

    private sfxPaddle() {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.connect(gain); gain.connect(this.masterGain)
        osc.type = 'square'
        osc.frequency.setValueAtTime(480, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(240, this.ctx.currentTime + 0.06)
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08)
        osc.start(this.ctx.currentTime)
        osc.stop(this.ctx.currentTime + 0.08)
    }

    private sfxWall() {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.connect(gain); gain.connect(this.masterGain)
        osc.type = 'square'
        osc.frequency.setValueAtTime(320, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.05)
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06)
        osc.start(this.ctx.currentTime)
        osc.stop(this.ctx.currentTime + 0.06)
    }

    private sfxScore() {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.connect(gain); gain.connect(this.masterGain)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(660, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.35)
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4)
        osc.start(this.ctx.currentTime)
        osc.stop(this.ctx.currentTime + 0.4)
    }

    private sfxWin() {
        const notes = [523, 659, 784, 1047]
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator()
            const gain = this.ctx.createGain()
            osc.connect(gain); gain.connect(this.masterGain)
            const t = this.ctx.currentTime + i * 0.12
            osc.type = 'sine'
            osc.frequency.setValueAtTime(freq, t)
            gain.gain.setValueAtTime(0, t)
            gain.gain.linearRampToValueAtTime(0.22, t + 0.02)
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
            osc.start(t)
            osc.stop(t + 0.2)
        })
    }
}