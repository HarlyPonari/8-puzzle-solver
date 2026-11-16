from os import getenv
from flask import Blueprint, Flask, jsonify, request
import puzzle as p

app = Flask(__name__)

# Vercel forwards the original request path, so every API route lives under /api
# (same path in dev through the Vite proxy, in tests, and in production).
api = Blueprint("api", __name__, url_prefix="/api")

@app.get("/")
def test():
  return {
    "message": "Hello world.",
  }, 200

@api.post("/solve")
def solve_8_puzzle():
  data = request.get_json(silent=True) # malformed JSON -> None -> 400, not an exception
  
  if not isinstance(data, dict):
    return jsonify({"error": "Expected a JSON object"}), 400

  puzzle = data.get("puzzle")
  
  # data validation
  if(
    not isinstance(puzzle, list) # is it a list
    or len(puzzle) != 9 # is it 9 long?
    or any(type(n) is not int for n in puzzle) # are the entries ints
    or set(puzzle) != set(range(9))
  ):
    return jsonify({"error": "Invalid puzzle format"}), 400
  
  solution = p.astar(tuple(puzzle))
  if solution is None:
    return jsonify({
      "error": "This puzzle is unsolvable: its tile inversion count has the wrong parity to ever reach the goal."
    }), 422

  return jsonify({
    "solution_steps": solution
  }), 200

@api.get("/formulate")
def formulate_8_puzzle():
  return {
    "message": p.generate_eight_puzzle()
  }, 200

app.register_blueprint(api)

if __name__ == "__main__":
  env = getenv("ENVIRONMENT")
  is_prod = True if env != None and (env.lower() == "prod" or env.lower() == "production") else False

  app.run(
      host="0.0.0.0",
      port=3000,
      debug=not is_prod
  )
