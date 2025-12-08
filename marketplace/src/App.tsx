import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { Suspense, useEffect } from 'react'
import { Earth } from './components/Earth'
import { Markers } from './components/Markers'
import { CameraController } from './components/CameraController'
import { UIOverlay } from './components/UIOverlay'
import { AboutSection } from './components/AboutSection'
import { ProductListSection } from './components/ProductListSection'
import { useStore } from './store'

function Scene() {
  const selectedLocation = useStore((state) => state.selectedLocation)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={2} />

      <group>
        <Earth />
        <Markers />
      </group>

      <CameraController />

      <OrbitControls
        enablePan={false}
        enableZoom={false} // Disable user zoom
        enableRotate={true}
        rotateSpeed={0.5}
        autoRotate={!selectedLocation} // Auto rotate if nothing selected
        autoRotateSpeed={0.5}
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
  const selectedLocation = useStore((state) => state.selectedLocation)

  useEffect(() => {
    fetchLocations()
  }, [])

  // Scroll to products when location is selected
  useEffect(() => {
    if (selectedLocation) {
      const el = document.getElementById('products');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [selectedLocation])

  return (
    <div className="relative w-full min-h-screen bg-black">
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 z-0">
        <ErrorBoundary>
          <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Scrollable Content Layer - Pass clicks through where empty */}
      <div className="relative z-10 pointer-events-none">
        <UIOverlay /> {/* Header stays fixed inside overlay or we move it out. UIOverlay is fixed. */}

        {/* Spacer for the "Hero" globe view */}
        <div className="h-screen pointer-events-none" />

        {/* Sections */}
        <ProductListSection />
        <AboutSection />
      </div>
    </div>
  )
}

export default App
