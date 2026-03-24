# 🏓 Pong — React TypeScript
 
Jeu de Pong complet développé en React + TypeScript avec Canvas 2D, Web Audio API et IA adversaire.
 
## Stack technique
 
- **React 19** + **TypeScript** (strict)
- **Vite** — bundler et dev server
- **Phaser 3** — moteur de jeu
- **Vitest** — tests unitaires
 
## Lancer le projet
 
```bash
pnpm install
pnpm run dev       # http://localhost:5173
```
 
## Scripts disponibles
 
```bash
pnpm run dev       # serveur de développement
pnpm run build     # build de production (TypeScript + Vite)
pnpm run preview   # prévisualiser le build
pnpm run lint      # ESLint
pnpm vitest        # tests unitaires
pnpm vitest --ui   # interface graphique des tests
pnpm vitest run    # tests en mode CI (une seule passe)
```

## Contrôles
 
| Action        | Joueur 1 | Joueur 2 (PvP) |
|---------------|----------|----------------|
| Monter        | W        | ↑              |
| Descendre     | S        | ↓              |
| Pause         | Echap    | Echap          |
 
## Modes de jeu
 
- **2 Joueurs** — PvP local sur le même clavier
- **Solo vs IA** — 3 niveaux : Facile / Moyen / Difficile
 
L'IA prédit la trajectoire de la balle en simulant les rebonds sur les murs plutôt que de simplement suivre la balle.
 