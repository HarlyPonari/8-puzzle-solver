import { RoundedBox } from '@react-three/drei'
import { gridPosition } from '../../lib/puzzle'
import { PITCH, TILE_SIZE, TRAY_DEPTH, TRAY_SIZE } from './constants'

const CELLS = Array.from({ length: 9 }, (_, i) => i)

export function Tray3D({ solved }: { solved: boolean }) {
  return (
    <group>
      <RoundedBox
        args={[TRAY_SIZE, TRAY_SIZE, TRAY_DEPTH]}
        radius={0.16}
        smoothness={4}
        position={[0, 0, -TRAY_DEPTH / 2]}
        receiveShadow
      >
        <meshStandardMaterial
          color={solved ? '#2f6b4f' : '#2a2f45'}
          emissive={solved ? '#22c55e' : '#000000'}
          emissiveIntensity={solved ? 0.35 : 0}
          roughness={0.7}
        />
      </RoundedBox>
      {CELLS.map((i) => {
        const { x, y } = gridPosition(i, PITCH)
        return (
          <RoundedBox
            key={i}
            args={[TILE_SIZE + 0.06, TILE_SIZE + 0.06, 0.05]}
            radius={0.03}
            smoothness={3}
            position={[x, y, -0.015]}
            receiveShadow
          >
            <meshStandardMaterial color={solved ? '#1d4a36' : '#181b2a'} roughness={0.9} />
          </RoundedBox>
        )
      })}
    </group>
  )
}
