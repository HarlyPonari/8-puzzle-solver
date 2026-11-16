# 8 Puzzle Solver

8 Puzzle Solver is an informed search 8 puzzle solver API using the A* searching algorithm.
`frontend/` is a vite/typescript React backed frontend website for visualization of the 8 puzzle solver algorithm.
`backend/` is a Flask HTTP API (all routes live under `/api`) used by the `frontend/` vite app.

## Requirements
- Python   v03.11.02
- Flask    v03.01.03
- Gunicorn v27.00.00
- Node     v22.23.05
- Npm      v10.09.09

## Usage
### Backend Setup
1. First install and then activate the virtual environment.
```bash
python3 -m venv .venv && source .venv/bin/activate
```

2. Install the requirements (run from `backend/`). `requirements.txt` holds only the runtime dependency (Flask) and is what gets deployed; `requirements-dev.txt` adds `pytest` and `gunicorn` for local work
```bash
pip install -r requirements-dev.txt
```

3. Now run the `app.py` file. The API is served on `http://localhost:3000` under `/api` (`POST /api/solve`, `GET /api/formulate`)
```bash
python app.py
```

### Frontend Setup
1. Enter your current working directory is the `frontend/` directory
2. Ensure you are running node version 22.23.05 as well as npm version 10.09.09 via the command `node -v && npm -v`
3. Now install the packages using `npm ci` to clean install the node modules
4. For dev mode in your console enter `npm run dev`. The Vite dev server proxies `/api/*` to the Flask server on port 3000 (start the backend first), so the frontend always calls `/api/...`


### Running Tests
1. The project uses `pytest` for verification of the backend functions. The package is declared inside of `backend/requirements-dev.txt`
2. From `backend/`, run `python3 -m pytest -v`
3. From `frontend/`, run `npm test` (vitest), and `npm run build` / `npm run lint` for the build and linter


## Deployment
The repo deploys to [Vercel](https://vercel.com) as **one project on one domain**, using [Vercel Services](https://vercel.com/docs/services): `frontend/` is built as static Vite files and `backend/` runs as a Python (Flask) Vercel Function. The root `vercel.json` declares both services and routes `/api/*` to Flask and everything else to the frontend.

How it fits together:
- Vercel forwards the original request path to the service, so Flask's routes are registered under `/api` (a Flask Blueprint with `url_prefix="/api"`). The same paths work in dev through the Vite proxy, in tests, and in production, and the frontend code is identical everywhere.
- The function only installs `backend/requirements.txt` (Flask). `pytest`/`gunicorn` live in `backend/requirements-dev.txt`, and `.vercelignore` keeps tests out of the upload.

Steps (run everything from the **repo root**):
1. Install the Vercel CLI (version 48.2.10 or newer is required for Python/Flask support) and log in
```bash
npm i -g vercel
vercel login
```

2. Link the repo to a new Vercel project. Accept the defaults: root directory `./`, and do not override any build settings (they come from `vercel.json`)
```bash
vercel link
```

3. Deploy a preview, and open the URL it prints
```bash
vercel deploy
```

4. Smoke test the preview (replace `<url>`; preview URLs may require you to be logged in to Vercel because of Deployment Protection)
```bash
curl <url>/api/formulate
curl -X POST <url>/api/solve -H 'content-type: application/json' -d '{"puzzle":[7,2,4,5,0,6,8,3,1]}'
```

5. Promote to production
```bash
vercel deploy --prod
```

To run both services together locally the way Vercel does (frontend on one origin with `/api` routed to Flask), use `vercel dev` (or `vercel dev --local` to skip logging in).
