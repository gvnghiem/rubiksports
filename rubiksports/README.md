# Rubiksports 🧊

An interactive **2×2, 3×3 and 4×4 Rubik's cube** you can play in the browser — desktop or phone.
Plain JavaScript (ES modules) + [Three.js](https://threejs.org) (vendored, no build step).

## Features

- **Play it**: drag a layer on the cube to turn it, drag the background to rotate the view, pinch / scroll to zoom
- **Randomize**: scrambles with a standard-length random scramble (2×2: 11, 3×3: 20, 4×4: 40 moves)
- **Solve it**: animates the cube back to solved
- **Timer**: press *Start*; it stops automatically when you solve the cube by hand. Best times are saved per size
- **Move log**: every scramble move, your own turns and the solver's moves in standard notation (`R U' F2 M 2L` …), with *Copy* and *Clear*
- **Themes**: Outdoors, Competition arena, Home, Mall, Beach, Space — they change the backdrop, lighting and UI colours
- **Responsive**: touch-friendly layout, move pad for tapping turns, landscape-phone layout
- **Keyboard**: `R L U D F B` turn a face, `Shift` = inverse; `M E S` slices on 3×3

## Run it

ES modules need a web server (opening `index.html` via `file://` won't work):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

URL options: `?size=2|3|4` and `?theme=outdoors|competition|home|mall|beach|space`.

## Deploy on GitHub Pages

Settings → Pages → *Deploy from a branch* → `main` / root. No build step needed.

## How the solver works

*Solve it* undoes every move made since the cube was last solved (scramble + your own turns, with consecutive
turns of the same layer merged). It is reliable on every size, but it is not an optimal solver — it replays your
history backwards rather than computing a shortest solution.

## Notation

Face turns `U D L R F B` are clockwise as seen from that face; `'` = counter-clockwise, `2` = half turn.
On 3×3, `M E S` are the middle slices. On 4×4, `2R`, `2L`, `2U`, `2D`, `2F`, `2B` are the inner slices.

## Project layout

```
index.html        page + controls
css/style.css     responsive layout and theming variables
js/cube.js        cube model, move animation, notation, solved check
js/themes.js      scenic SVG backgrounds, lighting and UI palettes
js/app.js         renderer, input, timer, move log, solver, wiring
vendor/           three.js (MIT) — minified ES module build
```

## License

MIT for this project. Three.js is © its authors, MIT (see `vendor/THREE-LICENSE`).
