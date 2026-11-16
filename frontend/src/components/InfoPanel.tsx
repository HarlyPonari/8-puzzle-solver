import {
  blankDirection,
  findMovedTile,
  isGoal,
  tileDirection,
  type Board,
} from '../lib/puzzle'

const ARROW = { up: '↑', down: '↓', left: '←', right: '→' } as const

interface InfoPanelProps {
  steps: Board[] | null
  step: number
}

export function InfoPanel({ steps, step }: InfoPanelProps) {
  const moves = steps === null ? null : steps.length - 1
  const current = steps === null ? null : steps[step]
  const previous = steps === null || step === 0 ? null : steps[step - 1]

  const direction = previous && current ? blankDirection(previous, current) : null
  const moved = previous && current ? findMovedTile(previous, current) : null
  const atGoal = current !== null && isGoal(current)

  let moveText = 'Press Solve to compute the solution.'
  if (steps !== null) {
    if (step === 0) {
      moveText = moves === 0 ? 'Already solved: nothing to move.' : 'Start state.'
    } else if (direction !== null && moved !== null) {
      moveText = `Blank moves ${direction} ${ARROW[direction]} (tile ${moved.tile} slides ${tileDirection(direction)})`
    }
  }

  return (
    <section className="panel" aria-labelledby="info-heading">
      <h2 id="info-heading">Solution</h2>
      <dl className="stats">
        <div>
          <dt>Moves</dt>
          <dd>{moves ?? '–'}</dd>
        </div>
        <div>
          <dt>Current step</dt>
          <dd>{steps === null ? '–' : step}</dd>
        </div>
        <div>
          <dt>Goal</dt>
          <dd className={atGoal ? 'goal-yes' : undefined}>{steps === null ? '–' : atGoal ? 'Reached ✓' : 'Not yet'}</dd>
        </div>
      </dl>
      <p className="move-text" aria-live="polite">
        {moveText}
      </p>
    </section>
  )
}
