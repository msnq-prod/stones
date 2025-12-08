import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { Suspense, useEffect } from 'react'
import { Earth } from './components/Earth'
import { Markers } from './components/Markers'
import { CameraController } from './components/CameraController'
import { UIOverlay } from './components/UIOverlay'
import { useStore } from './store'

function Scene() {
  const viewMode = useStore((state) => state.viewMode)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={2} />

      <group>
        <Earth />
        <Markers />
      </group>

      <CameraController />

      {/* 
        We use OrbitControls for the base interaction (rotation).
        When viewMode is LOCATION (zoomed in), we disable rotation so the user feels "locked in" 
        or focused on the location. CameraController takes over for positioning.
      */}
      <OrbitControls
        enablePan={false}
        enableZoom={viewMode === 'WORLD'}
        enableRotate={viewMode === 'WORLD'}
        minDistance={1.8}
        maxDistance={10}
        rotateSpeed={0.5}
      />
    </>
  )
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-white p-10 text-center"><h1>Something went wrong.</h1><button onClick={() => window.location.reload()} className="bg-blue-500 px-4 py-2 mt-4 rounded">Reload</button></div>;
    }

    return this.props.children;
  }
}

function App() {
  const fetchLocations = useStore((state) => state.fetchLocations)

  useEffect(() => {
    fetchLocations()
  }, [])

  return (
    <div className="w-full h-screen bg-black relative">
      <ErrorBoundary>
        <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
      <UIOverlay />
    </div>
  )
}

export default App
