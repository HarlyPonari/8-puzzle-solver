from os import getenv
from logging import debug
from flask import Flask, jsonify
import solver

app = Flask(__name__)

@app.get("/")
def test():
  return {
    "message": "Hello world.",
  }, 200


@app.get("/formulate")
def formulate_8_puzzle():
  return {
    "message": solver.generate_eight_puzzle()
  }, 200


if __name__ == "__main__":
  env = getenv("ENVIRONMENT")
  is_prod = True if env != None and (env.lower() == "prod" or env.lower() == "production") else False

  app.run(
      host="0.0.0.0",
      port=3000,
      debug=not is_prod
  )
