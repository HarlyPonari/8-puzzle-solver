export type Board = readonly number[]

export const SIZE = 3
export const TILE_COUNT = SIZE * SIZE

export const GOAL: Board = [0, 1, 2, 3, 4, 5, 6, 7, 8]

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface TileMove {
  tile: number

  from: number

  to: number
}

export function indexToRowCol(index: number): { row: number; col: number } {
  return { row: Math.floor(index / SIZE), col: index % SIZE }
}

export function gridPosition(index: number, pitch: number): { x: number; y: number } {
  const { row, col } = indexToRowCol(index)
  const centre = (SIZE - 1) / 2
  return { x: (col - centre) * pitch, y: (centre - row) * pitch }
}

export function isBoard(value: unknown): value is Board {
  if (!Array.isArray(value) || value.length !== TILE_COUNT) return false
  const seen = new Set<unknown>()
  for (const entry of value as unknown[]) {
    if (typeof entry !== 'number' || !Number.isInteger(entry) || entry < 0 || entry >= TILE_COUNT) {
      return false
    }
    seen.add(entry)
  }
  return seen.size === TILE_COUNT
}

export function boardsEqual(a: Board, b: Board): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i])
}

export function isGoal(board: Board): boolean {
  return boardsEqual(board, GOAL)
}

export type ParseResult = { ok: true; board: Board } | { ok: false; error: string }

export function parseBoardInput(text: string): ParseResult {
  const trimmed = text.trim()
  if (trimmed === '') {
    return { ok: false, error: 'Enter 9 numbers from 0 to 8 (0 is the blank).' }
  }

  let tokens = trimmed.split(/[\s,]+/).filter((token) => token !== '')
  if (tokens.length === 1 && /^\d{9}$/.test(tokens[0])) {
    tokens = tokens[0].split('')
  }

  const notNumber = tokens.find((token) => !/^\d+$/.test(token))
  if (notNumber !== undefined) {
    return { ok: false, error: `"${notNumber}" is not a number from 0 to 8.` }
  }

  const numbers = tokens.map(Number)
  const outOfRange = numbers.find((n) => n >= TILE_COUNT)
  if (outOfRange !== undefined) {
    return { ok: false, error: `${outOfRange} is out of range, use 0 to 8.` }
  }

  if (numbers.length !== TILE_COUNT) {
    return { ok: false, error: `Enter exactly 9 numbers (got ${numbers.length}).` }
  }

  const seen = new Set<number>()
  for (const n of numbers) {
    if (seen.has(n)) {
      return { ok: false, error: `${n} appears more than once, each of 0 to 8 must appear exactly once.` }
    }
    seen.add(n)
  }

  return { ok: true, board: numbers }
}

function areAdjacent(a: number, b: number): boolean {
  const pa = indexToRowCol(a)
  const pb = indexToRowCol(b)
  return Math.abs(pa.row - pb.row) + Math.abs(pa.col - pb.col) === 1
}

export function findMovedTile(prev: Board, next: Board): TileMove | null {
  if (prev.length !== TILE_COUNT || next.length !== TILE_COUNT) return null

  const changed: number[] = []
  for (let i = 0; i < TILE_COUNT; i++) {
    if (prev[i] !== next[i]) changed.push(i)
  }
  if (changed.length !== 2) return null

  const [a, b] = changed
  const oldBlank = prev[a] === 0 ? a : prev[b] === 0 ? b : -1
  if (oldBlank === -1) return null

  const tileFrom = oldBlank === a ? b : a
  const tile = prev[tileFrom]

  if (next[oldBlank] !== tile || next[tileFrom] !== 0) return null
  if (!areAdjacent(tileFrom, oldBlank)) return null

  return { tile, from: tileFrom, to: oldBlank }
}

export function blankDirection(prev: Board, next: Board): Direction | null {
  const move = findMovedTile(prev, next)
  if (move === null) return null

  const blankFrom = indexToRowCol(move.to)
  const blankTo = indexToRowCol(move.from)
  if (blankTo.row < blankFrom.row) return 'up'
  if (blankTo.row > blankFrom.row) return 'down'
  return blankTo.col < blankFrom.col ? 'left' : 'right'
}

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

export function tileDirection(blank: Direction): Direction {
  return OPPOSITE[blank]
}
