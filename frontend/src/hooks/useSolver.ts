import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, formulate, isAbortError, solve } from '../lib/api'
import type { Board } from '../lib/puzzle'

export type SolverStatus = 'idle' | 'loading' | 'error'

function messageOf(error: unknown): string {
  if (error instanceof ApiError) return error.message
  return 'Something went wrong. Please try again.'
}

export function useSolver() {
  const [status, setStatus] = useState<SolverStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [solution, setSolution] = useState<Board[] | null>(null)
  const controller = useRef<AbortController | null>(null)

  const begin = useCallback((): AbortSignal => {
    controller.current?.abort()
    const next = new AbortController()
    controller.current = next
    setStatus('loading')
    setError(null)
    return next.signal
  }, [])

  useEffect(() => () => controller.current?.abort(), [])

  const solveBoard = useCallback(
    async (board: Board): Promise<Board[] | null> => {
      setSolution(null)
      const signal = begin()
      try {
        const steps = await solve(board, signal)
        setSolution(steps)
        setStatus('idle')
        return steps
      } catch (e) {
        if (isAbortError(e)) return null
        setError(messageOf(e))
        setStatus('error')
        return null
      }
    },
    [begin],
  )

  const randomBoard = useCallback(async (): Promise<Board | null> => {
    setSolution(null)
    const signal = begin()
    try {
      const board = await formulate(signal)
      setStatus('idle')
      return board
    } catch (e) {
      if (isAbortError(e)) return null
      setError(messageOf(e))
      setStatus('error')
      return null
    }
  }, [begin])

  const discard = useCallback(() => {
    controller.current?.abort()
    setSolution(null)
    setError(null)
    setStatus('idle')
  }, [])

  return { status, error, solution, solveBoard, randomBoard, discard }
}
