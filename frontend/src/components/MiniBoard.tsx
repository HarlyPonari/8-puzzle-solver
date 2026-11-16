import type { Board } from '../lib/puzzle'

interface MiniBoardProps {
  board: Board

  highlightTile?: number | null
  goal?: boolean
}

export function MiniBoard({ board, highlightTile = null, goal = false }: MiniBoardProps) {
  return (
    <div className={goal ? 'mini mini-goal' : 'mini'} aria-hidden="true">
      {board.map((value, i) => (
        <span
          key={i}
          className={value === 0 ? 'mini-cell mini-blank' : value === highlightTile ? 'mini-cell mini-moved' : 'mini-cell'}
        >
          {value === 0 ? '' : value}
        </span>
      ))}
    </div>
  )
}
