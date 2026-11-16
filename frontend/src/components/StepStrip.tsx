import { useEffect, useRef } from 'react'
import { findMovedTile, isGoal, type Board } from '../lib/puzzle'
import { MiniBoard } from './MiniBoard'

interface StepStripProps {
  steps: Board[]
  step: number
  onSelect: (step: number) => void
}

export function StepStrip({ steps, step, onSelect }: StepStripProps) {
  const active = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    active.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [step])

  return (
    <section className="strip-section" aria-labelledby="strip-heading">
      <h2 id="strip-heading">All steps</h2>
      <ol className="strip">
        {steps.map((board, i) => {
          const moved = i === 0 ? null : findMovedTile(steps[i - 1], board)
          const current = i === step
          return (
            <li key={i}>
              <button
                type="button"
                ref={current ? active : undefined}
                className={current ? 'strip-item strip-item-active' : 'strip-item'}
                onClick={() => onSelect(i)}
                aria-current={current ? 'step' : undefined}
                aria-label={i === 0 ? 'Go to start state' : `Go to step ${i}`}
              >
                <MiniBoard board={board} highlightTile={moved?.tile ?? null} goal={isGoal(board)} />
                <span className="strip-index">{i}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
