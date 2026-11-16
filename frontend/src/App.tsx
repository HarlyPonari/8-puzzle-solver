import { Suspense, lazy, useState } from 'react'
import { InfoPanel } from './components/InfoPanel'
import { PlaybackPanel } from './components/PlaybackPanel'
import { StartPanel } from './components/StartPanel'
import { StepStrip } from './components/StepStrip'
import { usePlayback } from './hooks/usePlayback'
import { useSolver } from './hooks/useSolver'
import { animationMs } from './lib/playback'
import { isGoal, parseBoardInput, type Board } from './lib/puzzle'
import './App.css'

const Board3D = lazy(() =>
  import('./components/board3d/Board3D').then((m) => ({ default: m.Board3D })),
)

const DEFAULT_BOARD: Board = [7, 2, 4, 5, 0, 6, 8, 3, 1]

function App() {
  const [text, setText] = useState(DEFAULT_BOARD.join(' '))

  const [preview, setPreview] = useState<Board>(DEFAULT_BOARD)

  const solver = useSolver()
  const { state: playback, dispatch } = usePlayback()

  const parsed = parseBoardInput(text)
  const solution = solver.solution
  const loading = solver.status === 'loading'

  const step = solution ? Math.min(playback.step, solution.length - 1) : 0
  const board = solution ? solution[step] : preview
  const startBoard = solution ? solution[0] : preview
  const moves = solution ? solution.length - 1 : 0
  const solved = solution !== null && isGoal(board)
  const playbackEnabled = solution !== null && !loading

  function changeText(next: string) {
    setText(next)

    solver.discard()
    dispatch({ type: 'clear' })
    const result = parseBoardInput(next)
    if (result.ok) setPreview(result.board)
  }

  async function handleRandom() {
    dispatch({ type: 'clear' })
    const next = await solver.randomBoard()
    if (next) {
      setText(next.join(' '))
      setPreview(next)
    }
  }

  async function handleSolve() {
    if (!parsed.ok) return
    dispatch({ type: 'clear' })
    setPreview(parsed.board)
    const steps = await solver.solveBoard(parsed.board)
    if (steps) dispatch({ type: 'load', length: steps.length })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>8-Puzzle · A* Visualizer</h1>
        <p>
          Watch A* solve the puzzle one move at a time. Goal:{' '}
          <span className="goal-chip">0 1 2 3 4 5 6 7 8</span> (0 is the blank)
        </p>
      </header>

      <main className="layout">
        <section className={solved ? 'stage stage-solved' : 'stage'} aria-label="Puzzle board">
          <Suspense fallback={<p className="stage-loading">Loading 3D view…</p>}>
            <Board3D
              board={board}
              durationMs={animationMs(playback.speed)}
              solved={solved}
              resetKey={startBoard.join('')}
            />
          </Suspense>
          {solved && <div className="goal-badge">✓ Goal reached</div>}
          <p className="stage-hint">Drag to look around</p>
        </section>

        <aside className="sidebar">
          <StartPanel
            text={text}
            onTextChange={changeText}
            validationError={parsed.ok ? null : parsed.error}
            requestError={solver.error}
            loading={loading}
            onRandom={() => void handleRandom()}
            onSolve={() => void handleSolve()}
          />
          <PlaybackPanel
            enabled={playbackEnabled}
            step={step}
            moves={moves}
            playing={playback.playing}
            speed={playback.speed}
            onPrev={() => dispatch({ type: 'prev' })}
            onNext={() => dispatch({ type: 'next' })}
            onToggle={() => dispatch({ type: 'toggle' })}
            onReset={() => dispatch({ type: 'reset' })}
            onSpeed={(speed) => dispatch({ type: 'setSpeed', speed })}
          />
          <InfoPanel steps={solution} step={step} />
        </aside>
      </main>

      {solution && (
        <StepStrip
          steps={solution}
          step={step}
          onSelect={(i) => dispatch({ type: 'goTo', step: i })}
        />
      )}
    </div>
  )
}

export default App
