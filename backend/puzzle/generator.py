import random as rd

def generate_eight_puzzle():
  puzzle = list(range(9)) # non-inclusive leaves out 9 but includes 0 for empty
  while True:
    rd.shuffle(puzzle)
    if is_solvable(puzzle):
      return tuple(puzzle)

def get_inv_count(arr):
  inv_count = 0
  for i in range(len(arr)):
    for j in range(i + 1, len(arr)):
      if arr[i] > arr[j]:
        inv_count += 1
  return inv_count

def is_solvable(puzzle):
  # the blank (0) is not a tile and must not count towards inversions
  tiles = [n for n in puzzle if n != 0]
  return get_inv_count(tiles) % 2 == 0
