export const SPEEDS = [0.5, 1, 1.5, 2, 3] as const
export const DEFAULT_SPEED = 1

export const BASE_ANIMATION_MS = 300

export function animationMs(speed: number): number {
  return BASE_ANIMATION_MS / speed
}

export function autoplayIntervalMs(speed: number): number {
  return (BASE_ANIMATION_MS + 150) / speed
}

export interface PlaybackState {
  length: number
  step: number
  playing: boolean
  speed: number
}

export type PlaybackAction =
  | { type: 'load'; length: number }
  | { type: 'clear' }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'goTo'; step: number }
  | { type: 'reset' }
  | { type: 'toggle' }
  | { type: 'tick' }
  | { type: 'setSpeed'; speed: number }

export const initialPlaybackState: PlaybackState = {
  length: 0,
  step: 0,
  playing: false,
  speed: DEFAULT_SPEED,
}

function clampStep(state: PlaybackState, step: number): number {
  return Math.max(0, Math.min(step, state.length - 1))
}

export function playbackReducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  const last = state.length - 1

  switch (action.type) {
    case 'load':
      return { ...state, length: action.length, step: 0, playing: false }
    case 'clear':
      return { ...state, length: 0, step: 0, playing: false }
    case 'next':
      return { ...state, step: clampStep(state, state.step + 1), playing: false }
    case 'prev':
      return { ...state, step: clampStep(state, state.step - 1), playing: false }
    case 'goTo':
      return { ...state, step: clampStep(state, action.step), playing: false }
    case 'reset':
      return { ...state, step: 0, playing: false }
    case 'toggle':
      if (state.length <= 1) return state
      if (state.playing) return { ...state, playing: false }

      return { ...state, step: state.step >= last ? 0 : state.step, playing: true }
    case 'tick': {
      if (!state.playing) return state
      const step = clampStep(state, state.step + 1)
      return { ...state, step, playing: step < last }
    }
    case 'setSpeed':
      return { ...state, speed: action.speed }
  }
}
