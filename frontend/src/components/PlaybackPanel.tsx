import { SPEEDS } from '../lib/playback'

interface PlaybackPanelProps {
  enabled: boolean
  step: number

  moves: number
  playing: boolean
  speed: number
  onPrev: () => void
  onNext: () => void
  onToggle: () => void
  onReset: () => void
  onSpeed: (speed: number) => void
}

export function PlaybackPanel({
  enabled,
  step,
  moves,
  playing,
  speed,
  onPrev,
  onNext,
  onToggle,
  onReset,
  onSpeed,
}: PlaybackPanelProps) {
  return (
    <section className="panel" aria-labelledby="playback-heading">
      <h2 id="playback-heading">Playback</h2>

      <p className="step-label" aria-live="polite">
        {enabled ? `Step ${step} / ${moves}` : 'Step – / –'}
      </p>

      <div className="button-row">
        <button type="button" className="btn" onClick={onPrev} disabled={!enabled || step === 0}>
          ◀ Prev
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onToggle}
          disabled={!enabled || moves === 0}
        >
          {playing ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button type="button" className="btn" onClick={onNext} disabled={!enabled || step >= moves}>
          Next ▶
        </button>
      </div>

      <div className="button-row">
        <button type="button" className="btn" onClick={onReset} disabled={!enabled || step === 0}>
          ⟲ Reset to start
        </button>
      </div>

      <div className="speed" role="group" aria-label="Playback speed">
        <span className="field-label">Speed</span>
        <div className="segmented">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              className={s === speed ? 'seg seg-active' : 'seg'}
              aria-pressed={s === speed}
              onClick={() => onSpeed(s)}
              disabled={!enabled}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
