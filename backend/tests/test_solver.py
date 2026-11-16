import random
from collections import deque

import pytest

import puzzle.solver as solver
from app import app
from puzzle.generator import generate_eight_puzzle, is_solvable
from puzzle.solver import GOAL, astar, heuristic, is_solved, neighbors


# ---------------------------------------------------------------- helpers

def bfs_distances():
  """True shortest distance to GOAL for every reachable state (moves are reversible)."""
  dist = {GOAL: 0}
  queue = deque([GOAL])
  while queue:
    state = queue.popleft()
    for n in neighbors(state):
      if n not in dist:
        dist[n] = dist[state] + 1
        queue.append(n)
  return dist


def is_legal_blank_move(a, b):
  """b is a after sliding the blank one step up/down/left/right (checked independently of solver.neighbors)."""
  ai, bi = a.index(0), b.index(0)
  (ar, ac), (br, bc) = divmod(ai, 3), divmod(bi, 3)
  if abs(ar - br) + abs(ac - bc) != 1:
    return False
  expected = list(a)
  expected[ai], expected[bi] = expected[bi], expected[ai]
  return list(b) == expected


def assert_valid_path(start, path):
  assert path[0] == start
  assert path[-1] == GOAL
  for prev, curr in zip(path, path[1:]):
    assert is_legal_blank_move(prev, curr), f"illegal step {prev} -> {curr}"


@pytest.fixture(scope="module")
def dist():
  return bfs_distances()


# ---------------------------------------------------------------- generator / endpoint basics

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
  assert is_solvable(puzzle) # full board incl. the blank: is_solvable filters 0 itself


# ---------------------------------------------------------------- goal / heuristic

def test_goal_is_blank_first():
  assert GOAL == (0, 1, 2, 3, 4, 5, 6, 7, 8)
  assert is_solved(GOAL)
  assert not is_solved((1, 2, 3, 4, 5, 6, 7, 8, 0))


def test_heuristic_is_manhattan_distance():
  assert heuristic(GOAL) == 0
  # tile 1 one step from home (index 1 -> index 0), blank moved to index 1
  assert heuristic((1, 0, 2, 3, 4, 5, 6, 7, 8)) == 1
  # tile 8 at index 0, goal index 8: (0,0) vs (2,2) = 4; every other tile is home, blank is skipped
  assert heuristic((8, 1, 2, 3, 4, 5, 6, 7, 0)) == 4
  # tile 3 at index 0 (goal (1,0)) and tile 0 swapped out: |0-1| + |0-0| = 1
  assert heuristic((3, 1, 2, 0, 4, 5, 6, 7, 8)) == 1


def test_heuristic_never_overestimates(dist):
  # admissibility: h(s) <= true distance for every reachable state
  for state, d in dist.items():
    assert heuristic(state) <= d


# ---------------------------------------------------------------- solvability

def test_is_solvable_ignores_blank():
  # same tile order 1..8, blank at every index: all solvable
  for i in range(9):
    tiles = list(range(1, 9))
    tiles.insert(i, 0)
    assert is_solvable(tiles)
    assert is_solvable(tuple(tiles))
  # swapping two tiles flips the parity
  assert not is_solvable((2, 1, 0, 3, 4, 5, 6, 7, 8))


def test_is_solvable_matches_bfs_reachability(dist):
  # the parity rule must agree with real reachability on every permutation
  from itertools import permutations
  for perm in permutations(range(9)):
    assert is_solvable(perm) == (perm in dist)


# ---------------------------------------------------------------- astar

def test_known_26_move_puzzle():
  start = (7, 2, 4, 5, 0, 6, 8, 3, 1)
  path = astar(start)
  assert path is not None
  assert len(path) - 1 == 26 # 27 states = 26 moves


def test_astar_already_solved():
  assert astar(GOAL) == [GOAL]


@pytest.mark.parametrize("seed", range(20))
def test_paths_are_valid(seed):
  rng = random.Random(seed)
  while True:
    board = list(range(9))
    rng.shuffle(board)
    if is_solvable(board):
      break
  start = tuple(board)
  path = astar(start)
  assert path is not None
  assert_valid_path(start, path)


@pytest.mark.parametrize("blank_index", range(9))
def test_blank_at_every_index_is_solved(blank_index):
  rng = random.Random(blank_index)
  tiles = list(range(1, 9))
  rng.shuffle(tiles)
  tiles.insert(blank_index, 0)
  if not is_solvable(tiles): # swap two tiles to fix parity
    a, b = [i for i, t in enumerate(tiles) if t != 0][:2]
    tiles[a], tiles[b] = tiles[b], tiles[a]
  start = tuple(tiles)
  assert start.index(0) == blank_index
  assert is_solvable(start)

  path = astar(start)
  assert path is not None
  assert_valid_path(start, path)


def test_unsolvable_boards_match_bfs(dist):
  # verified against BFS: this board is NOT reachable from GOAL (one swapped pair)
  unsolvable = (2, 1, 0, 3, 4, 5, 6, 7, 8)
  assert unsolvable not in dist
  # and the example from the task description is in fact solvable
  assert (1, 2, 0, 3, 4, 5, 6, 7, 8) in dist
  assert astar((1, 2, 0, 3, 4, 5, 6, 7, 8)) is not None


def test_unsolvable_returns_none_without_searching(monkeypatch):
  def boom(_state):
    raise AssertionError("astar searched an unsolvable board")

  monkeypatch.setattr(solver, "neighbors", boom)
  assert astar((2, 1, 0, 3, 4, 5, 6, 7, 8)) is None
  assert astar((0, 2, 1, 3, 4, 5, 6, 7, 8)) is None


def test_astar_is_optimal_on_random_boards(dist):
  random.seed(1234) # generate_eight_puzzle uses the global RNG; seed for reproducibility
  for _ in range(200):
    start = generate_eight_puzzle()
    path = astar(start)
    assert path is not None
    assert len(path) - 1 == dist[start], f"{start}: astar {len(path) - 1} vs optimal {dist[start]}"


# ---------------------------------------------------------------- POST /solve

def test_solve_endpoint_solvable():
  client = app.test_client()
  start = [7, 2, 4, 5, 0, 6, 8, 3, 1]
  response = client.post("/solve", json={"puzzle": start})
  assert response.status_code == 200
  steps = [tuple(s) for s in response.json["solution_steps"]]
  assert_valid_path(tuple(start), steps)
  assert len(steps) - 1 == 26


def test_solve_endpoint_unsolvable_is_422():
  client = app.test_client()
  response = client.post("/solve", json={"puzzle": [2, 1, 0, 3, 4, 5, 6, 7, 8]})
  assert response.status_code == 422
  assert "unsolvable" in response.json["error"].lower()


@pytest.mark.parametrize("body", [
  {"puzzle": [1, 2, 3]},                         # wrong length
  {"puzzle": [1, 1, 2, 3, 4, 5, 6, 7, 8]},       # duplicate / missing tile
  {"puzzle": [0, 1, 2, 3, 4, 5, 6, 7, "8"]},     # non-int entry
  {"puzzle": [0, 1, 2, 3, 4, 5, 6, 7, 9]},       # out of range
  {"puzzle": "012345678"},                       # not a list
  {"nope": 1},                                   # missing key
  [0, 1, 2, 3, 4, 5, 6, 7, 8],                   # not an object
])
def test_solve_endpoint_malformed_json_is_400(body):
  client = app.test_client()
  assert client.post("/solve", json=body).status_code == 400


def test_solve_endpoint_invalid_json_body_is_400():
  client = app.test_client()
  response = client.post("/solve", data="{not json", content_type="application/json")
  assert response.status_code == 400
