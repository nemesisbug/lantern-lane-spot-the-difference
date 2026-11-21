# lantern-lane-spot-the-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nemesisbug/lantern-lane-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/nemesisbug/lantern-lane-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Lantern Lane — a spot-the-difference game. Two near-identical pictures side by side: a lantern-lit night market, a koi pond garden, and a firefly rooftop skyline. Find every hidden change before the lanterns burn down.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Click a difference in either picture — or steer the crosshair with the arrow keys and press Space. H asks for a hint (−10s), P pauses, M mutes. A wrong click costs 5 seconds; a find earns +100 plus a time bonus.

## How it is built

- `game/index.html` — the page shell, one canvas, no network requests.
- `game/src/config.js` — constants: panels, scoring, rounds, palette.
- `game/src/scenes.js` — the three original scenes, each drawn twice (original vs altered) from the same code, with its list of differences.
- `game/src/world.js` — screens, rounds, finds, timer, score.
- `game/src/render.js` — HUD with the remaining counter, panels, gold find-rings, overlays.
- `game/src/input.js` — mouse + keyboard play, panel hit-testing.
- `game/src/audio.js` — synthesised WebAudio chimes, no audio files.
- `game/src/shots.js` — the staged screenshot scenes (`?shot=start|play|level2|end`).
- `game/src/random.js` — seeded scatter so every scene is deterministic.
- `main.ts` — the hand-in program; `vendor/makefun-game.ts` is the kit's library, unchanged.

Every scene is drawn in code for this game — original art, names and sounds, nothing borrowed from a commercial game.

---

<sub>Entered on [make.fun](https://make.fun/?ref=w642jqgx&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
