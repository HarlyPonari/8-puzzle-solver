import random as rd
def generate_eight_puzzle():
  puzzle = list(range(9)) # non-inclusive leaves out 9 but includes 0 for empty
  while True:
    rd.shuffle(puzzle) 
    numbers = []
    for n in puzzle:
      if n != 0:
        numbers.append(n)
    
    if isSolvable(numbers):
      return tuple(puzzle)

def getInvCount(arr):
  inv_count = 0
  for i in range(len(arr)):
    for j in range(i + 1, len(arr)):
      if arr[i] > arr[j]:
        inv_count += 1
  return inv_count

def isSolvable(puzzle):
  print(puzzle)
  inv_count = getInvCount(puzzle)
  return (inv_count % 2 == 0)
