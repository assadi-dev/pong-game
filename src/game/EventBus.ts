import Phaser from 'phaser'

/**
 * EventBus global — permet à GameScene (Phaser) d'envoyer
 * des événements vers React sans couplage direct.
 *
 * Usage côté Phaser :
 *   EventBus.emit('score-update', { left: 1, right: 0 })
 *
 * Usage côté React :
 *   useEffect(() => {
 *     EventBus.on('score-update', handler)
 *     return () => EventBus.off('score-update', handler)
 *   }, [])
 */
export const EventBus = new Phaser.Events.EventEmitter();