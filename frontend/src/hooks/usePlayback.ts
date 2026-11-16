import { useEffect, useReducer } from 'react'
import {
  autoplayIntervalMs,
  initialPlaybackState,
  playbackReducer,
} from '../lib/playback'

export function usePlayback() {
  const [state, dispatch] = useReducer(playbackReducer, initialPlaybackState)

  useEffect(() => {
    if (!state.playing) return
    const id = window.setTimeout(() => dispatch({ type: 'tick' }), autoplayIntervalMs(state.speed))
    return () => window.clearTimeout(id)
  }, [state.playing, state.step, state.speed])

  return { state, dispatch }
}
