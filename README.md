# Grokking Transformer Visualizer

An interactive web visualization of a one-layer Transformer trained on modular addition.

The project presents the model's complete inference pipeline, from token selection and embeddings to multi-head attention, the multilayer perceptron, output logits, and an interactive 3D logit surface.

## Features

- Interactive input tokens for `x`, `y`, and `=`.
- Token and positional embedding visualizations.
- Dynamic transition from `114 x 128` embeddings to the selected `3 x 128` representation.
- Visual construction of the initial residual stream `h0`.
- Four attention heads inside a single Transformer block.
- Multilayer perceptron visualization.
- Output probability-style activation vector.
- Interactive logit-112 surface in 2D and 3D.
- Camera rotation, panning, zooming, and draggable input marker.
- Optional fixed-sum constraint for exploring modular-addition diagonals.
- Responsive layout for desktop and mobile browsers.

## Model Architecture

The visualization represents a Transformer trained to compute:

```text
(x + y) mod 113
```

Main configuration:

| Component | Configuration |
| --- | --- |
| Transformer blocks | 1 |
| Attention heads | 4 |
| Model dimension | 128 |
| MLP dimension | 512 |
| Input sequence | `[x, y, =]` |
| Input vocabulary | 114 tokens |
| Output classes | 113 |

## Project Structure

```text
index.html
styles.css
app.js
grokking-visualizer/
|-- visualizador_logit112_superior.html
`-- activation_surfaces_seed_0.js
```

- `index.html` defines the main interactive pipeline structure.
- `styles.css` contains the visual design, responsive layout, and transitions.
- `app.js` contains the interactions, matrix states, and view navigation.
- `visualizador_logit112_superior.html` renders the logit surface.
- `activation_surfaces_seed_0.js` contains the precomputed model data used by the surface visualizer.

## Running Locally

The project is fully static and does not require a backend.

Open `index.html` directly in a modern browser, or serve the directory locally:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000/
```

## Deployment

The web experience can be deployed on GitHub Pages, Cloudflare Pages, Netlify, or Vercel.

Keep the `grokking-visualizer` directory beside it so the embedded logit visualization and its data remain accessible.

## Interaction Guide

- Select values for `x` and `y` from the input matrix.
- Click the embedding block to inspect token and positional embeddings.
- Use the `=` button to construct `h0`.
- Click the final `114 x 1` vector to open the logit visualizer.
- Drag with the left mouse button to pan.
- Drag the yellow marker to change the selected input.
- Drag with the right mouse button to rotate the 3D camera.
- Use the mouse wheel to zoom.
- Press `Escape` or `BACK` to return to the pipeline.

## Purpose

This project was created as an educational and portfolio-oriented exploration of grokking, mechanistic interpretability, and the internal computations of a small Transformer trained on an algorithmic task.

## License

This project is available under the [MIT License](LICENSE).
