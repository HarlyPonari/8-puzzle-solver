# 8 Puzzle Solver

**Generative AI free solver code:**
- [`backend/puzzle/solver.py`](backend/puzzle/solver.py) - the A\* search, the heuristic and the move generation
- [`backend/puzzle/generator.py`](backend/puzzle/generator.py) - makes the random puzzles

Live demo: https://8-puzzle-solver-neon.vercel.app/

This is a project that solves the 8 puzzle (the little sliding tile game with 8 numbered tiles and one empty space). You give it a scrambled board and it finds the moves to get it back to the solved state. You can then play the solution back step by step in a 3D board.

## How it works

The solver uses the **A\* search algorithm**. A\* looks at the board, tries every move it can make, and always picks the board that looks closest to being solved. To guess how close a board is, it uses the **Manhattan distance**: for every tile, count how many squares away it is from where it should be, then add it all up. A\* also keeps track of how many moves it already made, so it ends up finding the shortest solution.

Not every scrambled board can be solved. If the number of "inversions" has the wrong parity, the puzzle is impossible, and the API just tells you that.

## How to use the visualization

Open the live demo (or run it locally, see below) and then:

1. **Enter a start board.** Type 9 numbers in the "Start state" box, row by row, with `0` as the blank. For example `7 2 4 5 0 6 8 3 1` is the board
   ```
   7 2 4
   5 _ 6
   8 3 1
   ```
   Or just press **Random** to get a random board.
2. **Press Solve.** The page sends the board to the backend and waits for the solution. If the puzzle can't be solved, or the input is wrong (like a repeated number), you get a message instead.
3. **Play the solution.** Once it's solved, the 3D board shows the start state and the Playback panel unlocks:
   - **Play / Pause** runs the moves automatically
   - **Prev / Next** goes one move back or forward
   - **Reset to start** goes back to the first board
   - **Speed** changes how fast it plays (0.5x up to 3x)
   - The step counter shows which move you are on, like `Step 3 / 22`

## Project layout

- `backend/` - a small Flask API with the solver in `backend/puzzle/`
- `frontend/` - a React + TypeScript app (Vite) that shows the puzzle, uses react-three-fiber/three.js for the 3D board

The API has two routes (both are under `/api`):
- `GET /api/formulate` - gives you a random puzzle
- `POST /api/solve` - send `{"puzzle": [7,2,4,5,0,6,8,3,1]}` (0 is the empty space) and you get back the list of board states from start to solved

## Requirements

- Python 3.11 or newer
- Node 22 or newer (with npm)

Flask is the only thing the deployed backend needs. `pytest` and `gunicorn` are in `requirements-dev.txt` for local stuff.

## Running it locally

### Backend

Run these from the `backend/` folder.

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
python app.py
```

The server starts on `http://localhost:3000`.

### Frontend

Run these from the `frontend/` folder. Start the backend first, because Vite forwards `/api` calls to Flask on port 3000.

```bash
npm ci
npm run dev
```

## Tests

```bash
# backend (from backend/)
python3 -m pytest -v

# frontend (from frontend/)
npm test
npm run lint
npm run build
```

## Deployment

It's hosted on Vercel as one project. The `frontend/` gets built into static files and the `backend/` runs as a Python function. The `vercel.json` in the root sends `/api/*` to Flask and everything else to the frontend. That's why the Flask routes all start with `/api`, so the same URLs work locally, in the tests and in production.

To deploy (from the repo root, you need Vercel CLI 48.2.10 or newer):

```bash
npm i -g vercel
vercel login
vercel link        # keep the defaults, vercel.json handles the build settings
vercel deploy      # preview
vercel deploy --prod
```

Quick check that the API works on a preview:

```bash
curl <url>/api/formulate
curl -X POST <url>/api/solve -H 'content-type: application/json' -d '{"puzzle":[7,2,4,5,0,6,8,3,1]}'
```

To run both parts together like Vercel does, use `vercel dev`.
