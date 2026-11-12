from os import getenv
from flask import Flask, request
import puzzle

app = Flask(__name__)

@app.get("/")
def test():
  return {
    "message": "Hello world.",
  }, 200


@app.get("/formulate")
def formulate_8_puzzle():
  return {
    "message": puzzle.generate_eight_puzzle()
  }, 200

@app.post("/")
def solve_puzzle_post():
  json = request.json
  if json is None:
    return {
        "message": "Invalid request"
    }, 500

  puzzle = json["puzzle"]
  return {
    "message": puzzle.solve_puzzle(puzzle)
  }

if __name__ == "__main__":
  env = getenv("ENVIRONMENT")
  is_prod = True if env != None and (env.lower() == "prod" or env.lower() == "production") else False

  app.run(
      host="0.0.0.0",
      port=3000,
      debug=not is_prod
  )
