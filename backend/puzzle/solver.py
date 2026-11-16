import heapq 
from puzzle.generator import is_solvable

BoardState = tuple[int, int, int, int, int, int, int, int, int]
# f, g, state where f = h + g (g is 0 for start)
HeapEntry = tuple[int, int, BoardState]

# needs a prio queue, we can use some sort of heap?
# min heap fits I believe and we can use heapq in python see https://www.geeksforgeeks.org/python/min-heap-in-python/
def astar(p: BoardState) -> list[BoardState] | None:
  if not is_solvable(p):
    return None

  frontier: list[HeapEntry] = [(heuristic(p), 0, p)] # a min heap not a list
  seen = set()
  g_score = {p: 0}
  
  solution: dict[BoardState, BoardState] = {} # so that we can rebuil dthe solution on the frontend
  while frontier:
    _, g, current = heapq.heappop(frontier)

    # if the current state was seen skip it
    if current in seen:
      continue

    # build the best soltuion once we have 
    if is_solved(current):
      path = [current] 
      while current in solution:
        current = solution[current]
        path.append(current)
      path.reverse()
      return path

    seen.add(current)

    # neighbor is an updated board state
    for neighbor in neighbors(current):
      if neighbor in seen:
        continue
      
      new_g = g + 1

      if new_g < g_score.get(neighbor, float("inf")):
        g_score[neighbor] = new_g
        solution[neighbor] = current

        new_f = new_g + heuristic(neighbor)
        heapq.heappush(frontier, (new_f, new_g, neighbor))

  return None

def heuristic(state):
  distance = 0

  for index, tile in enumerate(state):
    if tile == 0: # we skip the empty tile for manhattan distance, we sort tiles not empty space
      continue
    goal_index = tile - 1 # for example, 8 we want it in the (8-1) position (grid starts at 0)

    # using the divide mod func we have the x1,y1 and x2, y2 for the current and goal tiles
    curr_row, curr_col = divide_mod(index, 3) 
    goal_row, goal_col = divide_mod(goal_index, 3)

    # sort of manhattan distance, saves on uneeded math like exponentiation and sqrt
    distance += abs(curr_row - goal_row)
    distance += abs(curr_col - goal_col)

  return distance


def is_solved(p: BoardState):
  return p == (1, 2, 3, 4, 5, 6, 7, 8, 0)

def neighbors(state: BoardState):
  empty = state.index(0)
  row, col = divide_mod(empty, 3)

  dirs = [
    (-1,  0),
    ( 1,  0),
    ( 0, -1),
    ( 0,  1)
  ]

  results = []
  for dr, dc in dirs:
    new_row = row + dr
    new_col = col + dc

    if 0 <= new_row < 3 and 0 <= new_col < 3:
      new_index = new_row * 3 + new_col

      new_state = list(state)

      # swap the empty with the neigbor tile
      new_state[empty], new_state[new_index] = (new_state[new_index], new_state[empty])
      results.append(tuple(new_state))
  return results

# simple helper function
# since we ar eusing a tuple to represent the state the mod retuns the column and the quotient is the row
def divide_mod(dividend, base: int):
  return dividend // base, dividend % base

