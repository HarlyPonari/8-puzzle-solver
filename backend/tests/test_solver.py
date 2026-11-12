from werkzeug.wrappers import response
from app import app
from solver.puzzle import isSolvable

def test_formulation():
  client = app.test_client()

  response = client.get("/formulate")

  assert response.status_code == 200
  json = response.json
  assert json is not None
  puzzle = json["message"]
  assert len(puzzle) == 9

  seen = {} # we check if any duplicates occur
  for num in puzzle:
    seen[num] = seen.get(num, 0) + 1

  for count in seen.values():
    assert count == 1

  assert set(seen.keys()) == set(range(9)) # all 9 values (empty included) are accounted for.
      


def test_generated_puzzle_is_solvable():
  client = app.test_client()

  response = client.get("/formulate")
  json = response.json
  assert json is not None
  puzzle = json["message"]
  numbers = [n for n in puzzle if n != 0] # remove 0 from the array
  assert isSolvable(numbers)
