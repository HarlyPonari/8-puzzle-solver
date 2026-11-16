interface StartPanelProps {
  text: string
  onTextChange: (text: string) => void

  validationError: string | null

  requestError: string | null
  loading: boolean
  onRandom: () => void
  onSolve: () => void
}

export function StartPanel({
  text,
  onTextChange,
  validationError,
  requestError,
  loading,
  onRandom,
  onSolve,
}: StartPanelProps) {
  const showValidation = validationError !== null && text.trim() !== ''

  return (
    <section className="panel" aria-labelledby="start-heading">
      <h2 id="start-heading">Start state</h2>

      <label className="field-label" htmlFor="board-input">
        9 numbers, 0 is the blank (row by row)
      </label>
      <input
        id="board-input"
        className="board-input"
        type="text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={loading}
        spellCheck={false}
        autoComplete="off"
        placeholder="7 2 4 5 0 6 8 3 1"
        aria-invalid={showValidation}
        aria-describedby="board-feedback"
      />

      <div id="board-feedback" className="feedback" aria-live="polite">
        {showValidation && <p className="msg msg-warn">{validationError}</p>}
        {requestError !== null && (
          <p className="msg msg-error" role="alert">
            {requestError}
          </p>
        )}
        {loading && <p className="msg msg-info">Solving…</p>}
      </div>

      <div className="button-row">
        <button type="button" className="btn" onClick={onRandom} disabled={loading}>
          Random
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSolve}
          disabled={loading || validationError !== null}
        >
          {loading ? 'Solving…' : 'Solve'}
        </button>
      </div>
    </section>
  )
}
