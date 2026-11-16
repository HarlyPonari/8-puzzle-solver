import { describe, expect, it } from 'vitest'
import {
  animationMs,
  autoplayIntervalMs,
  initialPlaybackState,
  playbackReducer,
  type PlaybackAction,
  type PlaybackState,
} from './playback'

function run(actions: PlaybackAction[], from: PlaybackState = initialPlaybackState): PlaybackState {
  return actions.reduce(playbackReducer, from)
}

describe('playbackReducer', () => {
  it('load starts at step 0, paused', () => {
    const s = run([{ type: 'load', length: 5 }])
    expect(s).toMatchObject({ length: 5, step: 0, playing: false })
  })

  it('next/prev clamp to the solution bounds', () => {
    const loaded = run([{ type: 'load', length: 3 }])
    expect(run([{ type: 'prev' }], loaded).step).toBe(0)
    expect(run([{ type: 'next' }, { type: 'next' }, { type: 'next' }], loaded).step).toBe(2)
  })

  it('manual navigation pauses autoplay', () => {
    const playing = run([{ type: 'load', length: 5 }, { type: 'toggle' }])
    expect(playing.playing).toBe(true)
    expect(playbackReducer(playing, { type: 'next' }).playing).toBe(false)
    expect(playbackReducer(playing, { type: 'goTo', step: 3 })).toMatchObject({ step: 3, playing: false })
  })

  it('tick advances while playing and stops on the last board', () => {
    let s = run([{ type: 'load', length: 3 }, { type: 'toggle' }])
    s = playbackReducer(s, { type: 'tick' })
    expect(s).toMatchObject({ step: 1, playing: true })
    s = playbackReducer(s, { type: 'tick' })
    expect(s).toMatchObject({ step: 2, playing: false })
  })

  it('tick is a no-op while paused', () => {
    const s = run([{ type: 'load', length: 3 }])
    expect(playbackReducer(s, { type: 'tick' })).toBe(s)
  })

  it('toggle at the end replays from the start', () => {
    const atEnd = run([{ type: 'load', length: 3 }, { type: 'goTo', step: 2 }])
    expect(playbackReducer(atEnd, { type: 'toggle' })).toMatchObject({ step: 0, playing: true })
  })

  it('toggle does nothing with no solution or a 0-move solution', () => {
    expect(playbackReducer(initialPlaybackState, { type: 'toggle' }).playing).toBe(false)
    const single = run([{ type: 'load', length: 1 }])
    expect(playbackReducer(single, { type: 'toggle' }).playing).toBe(false)
  })

  it('reset returns to step 0 and pauses; speed survives load/reset', () => {
    let s = run([{ type: 'setSpeed', speed: 2 }, { type: 'load', length: 4 }, { type: 'goTo', step: 3 }])
    s = playbackReducer(s, { type: 'reset' })
    expect(s).toMatchObject({ step: 0, playing: false, speed: 2 })
  })

  it('clear empties the solution', () => {
    const s = run([{ type: 'load', length: 4 }, { type: 'clear' }])
    expect(s).toMatchObject({ length: 0, step: 0, playing: false })
  })
})

describe('timing helpers', () => {
  it('scale inversely with speed', () => {
    expect(animationMs(1)).toBe(300)
    expect(animationMs(3)).toBeCloseTo(100)
    expect(animationMs(0.5)).toBe(600)
    expect(autoplayIntervalMs(2)).toBeLessThan(autoplayIntervalMs(1))
  })

  it('always leaves the autoplay interval longer than the slide', () => {
    for (const speed of [0.5, 1, 1.5, 2, 3]) {
      expect(autoplayIntervalMs(speed)).toBeGreaterThan(animationMs(speed))
    }
  })
})
