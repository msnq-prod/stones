import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Scene } from './components/Scene'
import { UI } from './components/UI'

function App() {
  return (
    <div className="w-full h-full relative font-sans">
      <div className="absolute top-0 left-0 w-full h-full z-0 bg-black">
        <Canvas>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      <div className="relative z-10 w-full h-full pointer-events-none">
        <UI />
      </div>
    </div>
  )
}

export default App
