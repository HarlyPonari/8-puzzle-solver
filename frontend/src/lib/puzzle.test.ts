import { describe, expect, it } from 'vitest'
import {
  GOAL,
  blankDirection,
  boardsEqual,
  findMovedTile,
  gridPosition,
  isBoard,
  isGoal,
  parseBoardInput,
  tileDirection,
  type Board,
} from './puzzle'

describe('gridPosition', () => {
  it('centres the grid on the origin', () => {
    expect(gridPosition(4, 1.1)).toEqual({ x: 0, y: 0 })
  })

  it('puts row 0 at the TOP (positive y) and col 0 on the left (negative x)', () => {
    const topLeft = gridPosition(0, 1)
    expect(topLeft).toEqual({ x: -1, y: 1 })
    const bottomRight = gridPosition(8, 1)
    expect(bottomRight).toEqual({ x: 1, y: -1 })
  })

  it('moves one pitch per cell', () => {
    expect(gridPosition(1, 2).x - gridPosition(0, 2).x).toBe(2)
    expect(gridPosition(0, 2).y - gridPosition(3, 2).y).toBe(2)
  })
})

describe('isBoard', () => {
  it('accepts a permutation of 0-8', () => {
    expect(isBoard([7, 2, 4, 5, 0, 6, 8, 3, 1])).toBe(true)
  })

  it.each([
    ['wrong length', [0, 1, 2]],
    ['duplicate', [0, 1, 2, 3, 4, 5, 6, 7, 7]],
    ['out of range', [0, 1, 2, 3, 4, 5, 6, 7, 9]],
    ['non-integer', [0, 1, 2, 3, 4, 5, 6, 7, 8.5]],
    ['string entry', [0, 1, 2, 3, 4, 5, 6, 7, '8']],
    ['not an array', '012345678'],
    ['null', null],
  ])('rejects %s', (_label, value) => {
    expect(isBoard(value)).toBe(false)
  })
})

describe('parseBoardInput', () => {
  const expected = [7, 2, 4, 5, 0, 6, 8, 3, 1]

  it.each([
    ['spaces', '7 2 4 5 0 6 8 3 1'],
    ['commas', '7,2,4,5,0,6,8,3,1'],
    ['commas and spaces', ' 7, 2, 4,  5, 0, 6, 8, 3, 1 '],
    ['bare digits', '724506831'],
  ])('parses %s', (_label, text) => {
    const result = parseBoardInput(text)
    expect(result).toEqual({ ok: true, board: expected })
  })

  it('rejects empty input', () => {
    expect(parseBoardInput('   ').ok).toBe(false)
  })

  it('rejects too few numbers', () => {
    const result = parseBoardInput('1 2 3')
    expect(result).toEqual({ ok: false, error: 'Enter exactly 9 numbers (got 3).' })
  })

  it('rejects too many numbers', () => {
    const result = parseBoardInput('0 1 2 3 4 5 6 7 8 0')
    expect(result.ok).toBe(false)
  })

  it('rejects numbers outside 0-8', () => {
    const result = parseBoardInput('0 1 2 3 4 5 6 7 9')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('9')
  })

  it('rejects non-numeric tokens, negatives and decimals', () => {
    expect(parseBoardInput('a 1 2 3 4 5 6 7 8').ok).toBe(false)
    expect(parseBoardInput('-1 1 2 3 4 5 6 7 8').ok).toBe(false)
    expect(parseBoardInput('0.5 1 2 3 4 5 6 7 8').ok).toBe(false)
  })

  it('rejects duplicates', () => {
    const result = parseBoardInput('0 1 2 3 4 5 6 7 7')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('7')
  })
})

describe('boardsEqual / isGoal', () => {
  it('compares by value', () => {
    expect(boardsEqual([1, 2], [1, 2])).toBe(true)
    expect(boardsEqual([1, 2], [2, 1])).toBe(false)
  })

  it('recognises the blank-first goal only', () => {
    expect(isGoal(GOAL)).toBe(true)
    expect(isGoal([1, 2, 3, 4, 5, 6, 7, 8, 0])).toBe(false)
  })
})

describe('findMovedTile', () => {
  const base: Board = [1, 2, 3, 4, 0, 5, 6, 7, 8]

  it('finds the tile that slid into the old blank spot (blank moved up)', () => {
    const next: Board = [1, 0, 3, 4, 2, 5, 6, 7, 8]
    expect(findMovedTile(base, next)).toEqual({ tile: 2, from: 1, to: 4 })
  })

  it('finds the tile when the blank moved down', () => {
    const next: Board = [1, 2, 3, 4, 7, 5, 6, 0, 8]
    expect(findMovedTile(base, next)).toEqual({ tile: 7, from: 7, to: 4 })
  })

  it('finds the tile when the blank moved left', () => {
    const next: Board = [1, 2, 3, 0, 4, 5, 6, 7, 8]
    expect(findMovedTile(base, next)).toEqual({ tile: 4, from: 3, to: 4 })
  })

  it('finds the tile when the blank moved right', () => {
    const next: Board = [1, 2, 3, 4, 5, 0, 6, 7, 8]
    expect(findMovedTile(base, next)).toEqual({ tile: 5, from: 5, to: 4 })
  })

  it('works in reverse (the same tile moves back)', () => {
    const next: Board = [1, 0, 3, 4, 2, 5, 6, 7, 8]
    expect(findMovedTile(next, base)).toEqual({ tile: 2, from: 4, to: 1 })
  })

  it('returns null for identical boards', () => {
    expect(findMovedTile(base, base)).toBeNull()
  })

  it('returns null for a swap of two tiles that does not involve the blank', () => {
    expect(findMovedTile(base, [2, 1, 3, 4, 0, 5, 6, 7, 8])).toBeNull()
  })

  it('returns null when the blank jumps to a non-adjacent cell', () => {
    expect(findMovedTile(base, [0, 2, 3, 4, 1, 5, 6, 7, 8])).toBeNull()
  })

  it('returns null across a row wrap (index 2 and 3 are not neighbours)', () => {
    const a: Board = [1, 2, 0, 3, 4, 5, 6, 7, 8]
    const b: Board = [1, 2, 3, 0, 4, 5, 6, 7, 8]
    expect(findMovedTile(a, b)).toBeNull()
  })

  it('returns null when more than one move apart', () => {
    expect(findMovedTile(base, [1, 0, 3, 2, 4, 5, 6, 7, 8])).toBeNull()
  })

  it('returns null for wrong-sized boards', () => {
    expect(findMovedTile([0, 1], [1, 0])).toBeNull()
  })
})

describe('blankDirection', () => {
  const base: Board = [1, 2, 3, 4, 0, 5, 6, 7, 8]

  it('reports the direction the BLANK moved', () => {
    expect(blankDirection(base, [1, 0, 3, 4, 2, 5, 6, 7, 8])).toBe('up')
    expect(blankDirection(base, [1, 2, 3, 4, 7, 5, 6, 0, 8])).toBe('down')
    expect(blankDirection(base, [1, 2, 3, 0, 4, 5, 6, 7, 8])).toBe('left')
    expect(blankDirection(base, [1, 2, 3, 4, 5, 0, 6, 7, 8])).toBe('right')
  })

  it('returns null when the boards are not one move apart', () => {
    expect(blankDirection(base, base)).toBeNull()
    expect(blankDirection(base, [0, 2, 3, 4, 1, 5, 6, 7, 8])).toBeNull()
  })

  it('tileDirection is the opposite of the blank direction', () => {
    expect(tileDirection('up')).toBe('down')
    expect(tileDirection('down')).toBe('up')
    expect(tileDirection('left')).toBe('right')
    expect(tileDirection('right')).toBe('left')
  })

  it('replays a solution path: every consecutive pair is exactly one move', () => {
    const path: Board[] = [
      [1, 0, 2, 3, 4, 5, 6, 7, 8],
      [0, 1, 2, 3, 4, 5, 6, 7, 8],
    ]
    expect(blankDirection(path[0], path[1])).toBe('left')
    expect(isGoal(path[1])).toBe(true)
  })
})
