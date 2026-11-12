from puzzle.generator import is_solvable

# needs a prio queue, we can use some sort of heap?
# min heap fits I believe and we can use heapq in python see https://www.geeksforgeeks.org/python/min-heap-in-python/
def astar(p: tuple[int, int, int, int, int, int, int, int, int]):
  if not is_solvable(p):
    return ()
  
  state = p
  while is_solved(state):
    print("Not yet implemented")
    break;
  return ()

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


def is_solved(p: tuple[int, int, int, int, int, int, int, int, int]): 
  return p == (1, 2, 3, 4, 5, 6, 7, 8, 0)

# simple helper function
# since we ar eusing a tuple to represent the state the mod retuns the column and the quotient is the row
def divide_mod(dividend, base: int):
  return dividend // base, dividend % base
