# Comanda

A 3D wizard-strategy game: command familiars that fight autonomously based on
behavior rules. Built with Three.js, TypeScript, and Vite.

## Getting started

```bash
npm install
npm run dev
```

## Current milestone

- A flat ground plane.
- A controllable "wizard" camera: `WASD` to pan, `Q`/`E` to rotate, `R`/`F`
  to adjust pitch, scroll to zoom.
- One familiar and one enemy unit, each running a `SeekAndAttackBehavior`:
  walk toward the nearest enemy, then attack once in range.

## Project structure

```
src/
  main.ts                        entry point, bootstraps Game + HUD
  game/
    Game.ts                      scene/renderer setup, main loop
    camera/WizardCamera.ts       controllable RTS-style camera rig
    world/
      Ground.ts                  ground plane + grid
      World.ts                   unit registry, spatial queries (nearest enemy, etc.)
    entities/
      Unit.ts                    unit state: hp, movement, combat
      UnitMesh.ts                placeholder unit visuals
      Team.ts                    team identifiers
    behaviors/
      Behavior.ts                behavior rule interface
      SeekAndAttackBehavior.ts   walk-to-nearest-enemy-and-attack rule
```

Behaviors are pluggable per unit (`Unit.behavior`), so future familiar types
can compose or swap in different rule sets without touching `Unit` itself.
