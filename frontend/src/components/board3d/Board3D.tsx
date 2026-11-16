import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { GOAL, type Board } from '../../lib/puzzle'
import { Tile3D } from './Tile3D'
import { Tray3D } from './Tray3D'

const TILE_VALUES = GOAL.filter((value) => value !== 0)

interface Board3DProps {
  board: Board

  durationMs: number

  solved: boolean

  resetKey: string
}

export function Board3D({ board, durationMs, solved, resetKey }: Board3DProps) {
  return (
    <Canvas
      shadows="percentage"
      flat
      dpr={[1, 2]}
      camera={{ position: [0, 2.4, 8], fov: 38 }}
      aria-label="3D view of the 8-puzzle board"
    >
      <ambientLight intensity={0.9} />
      <hemisphereLight args={['#dfe6ff', '#2a2f45', 0.7]} />
      <directionalLight
        position={[3, 6, 7]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0005}
      />
      <pointLight position={[-4, -2, 5]} intensity={8} color="#9db4ff" />

      <group key={resetKey}>
        <Tray3D solved={solved} />
        {TILE_VALUES.map((value) => {
          const index = board.indexOf(value)
          return (
            <Tile3D
              key={value}
              value={value}
              index={index}
              durationMs={durationMs}
              atHome={index === GOAL.indexOf(value)}
            />
          )
        })}
      </group>

      <OrbitControls
        enablePan={false}
        enableDamping
        minDistance={6}
        maxDistance={13}
        minPolarAngle={0.85}
        maxPolarAngle={1.75}
        minAzimuthAngle={-0.9}
        maxAzimuthAngle={0.9}
      />
    </Canvas>
  )
}
