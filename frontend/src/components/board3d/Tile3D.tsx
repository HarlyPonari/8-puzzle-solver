import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { getNumberTexture } from '../../lib/numberTexture'
import { gridPosition } from '../../lib/puzzle'
import { LIFT, PITCH, TILE_SIZE, TILE_THICKNESS } from './constants'

const TILE = '#f2e8d5'
const TILE_HOME = '#a6e3b9'

interface Motion {
  x: number
  y: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  start: number
  duration: number
  active: boolean
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

interface Tile3DProps {
  value: number

  index: number
  durationMs: number

  atHome: boolean
}

export function Tile3D({ value, index, durationMs, atHome }: Tile3DProps) {
  const group = useRef<Group>(null)
  const target = gridPosition(index, PITCH)
  const motion = useRef<Motion>({
    x: target.x,
    y: target.y,
    fromX: target.x,
    fromY: target.y,
    toX: target.x,
    toY: target.y,
    start: 0,
    duration: durationMs,
    active: false,
  })
  const texture = useMemo(() => getNumberTexture(value), [value])

  useLayoutEffect(() => {
    group.current?.position.set(motion.current.x, motion.current.y, 0)
  }, [])

  useLayoutEffect(() => {
    const m = motion.current
    if (m.toX === target.x && m.toY === target.y) return
    m.fromX = m.x
    m.fromY = m.y
    m.toX = target.x
    m.toY = target.y
    m.start = performance.now()
    m.duration = durationMs
    m.active = true
  }, [target.x, target.y, durationMs])

  useFrame(() => {
    const m = motion.current
    const g = group.current
    if (!m.active || !g) return

    const t = m.duration <= 0 ? 1 : Math.min(1, (performance.now() - m.start) / m.duration)
    const eased = easeInOutCubic(t)
    m.x = m.fromX + (m.toX - m.fromX) * eased
    m.y = m.fromY + (m.toY - m.fromY) * eased

    if (t >= 1) {
      m.active = false
      g.position.set(m.toX, m.toY, 0)
    } else {
      g.position.set(m.x, m.y, LIFT * Math.sin(Math.PI * t))
    }
  })

  return (
    <group ref={group}>
      <RoundedBox
        args={[TILE_SIZE, TILE_SIZE, TILE_THICKNESS]}
        radius={0.12}
        smoothness={4}
        position={[0, 0, TILE_THICKNESS / 2 + 0.01]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={atHome ? TILE_HOME : TILE} roughness={0.5} metalness={0} />
      </RoundedBox>
      <mesh position={[0, 0, TILE_THICKNESS + 0.014]}>
        <planeGeometry args={[TILE_SIZE * 0.78, TILE_SIZE * 0.78]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  )
}
