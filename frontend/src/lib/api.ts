import { isBoard, type Board } from './puzzle'

export type ApiErrorKind = 'invalid' | 'unsolvable' | 'server' | 'network'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status: number | null

  constructor(kind: ApiErrorKind, message: string, status: number | null = null) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

async function request(path: string, init: RequestInit): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`/api${path}`, init)
  } catch (error) {
    if (isAbortError(error)) throw error
    throw new ApiError('network', 'Could not reach the solver service. Is the backend running?')
  }

  const body = await readJson(response)
  if (response.ok) return body

  if (response.status === 422) {
    throw new ApiError('unsolvable', 'This puzzle is unsolvable', 422)
  }
  if (response.status === 400) {
    const detail = isRecord(body) && typeof body.error === 'string' ? body.error : null
    throw new ApiError('invalid', detail ?? 'The server rejected that puzzle as malformed.', 400)
  }
  throw new ApiError('server', `The solver service returned an error (${response.status}).`, response.status)
}

function unexpected(what: string): ApiError {
  return new ApiError('server', `The solver service sent an unexpected ${what}.`)
}

export async function solve(puzzle: Board, signal?: AbortSignal): Promise<Board[]> {
  const body = await request('/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ puzzle }),
    signal,
  })

  if (!isRecord(body) || !Array.isArray(body.solution_steps)) throw unexpected('response')
  const steps: unknown[] = body.solution_steps
  if (steps.length === 0 || !steps.every(isBoard)) throw unexpected('solution')
  return steps as Board[]
}

export async function formulate(signal?: AbortSignal): Promise<Board> {
  const body = await request('/formulate', { signal })
  if (!isRecord(body) || !isBoard(body.message)) throw unexpected('response')
  return body.message
}
