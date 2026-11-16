# 8 Puzzle Solver

8 Puzzle Solver is an informed search 8 puzzle solver API using the A* searching algorithm.
`frontend/` is a vite/typescript React backed frontend website for visualization of the 8 puzzle solver algorithm.
`backend/` is a flask/gunicorn HTTP server used for serving the backend API to the `frontend/` vite app.

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

2. Install the requirements
```bash
pip install -r requirements.txt
```

3. Now run the `app.py` file
```bash
python app.py
```

### Frontend Setup
1. Enter your current working directory is the `frontend/` directory
2. Ensure you are running node version 22.23.05 as well as npm version 10.09.09 via the command `node -v && npm -v`
3. Now install the packages using `npm ci` to clean install the node modules
4. For dev mode in your console enter `npm run dev`


### Running Tests
1. The project uses `pytest` for verification of the backend functions. The package is already declared inside of `requirements.txt`
2. Run `python3 -m pytest -v`

