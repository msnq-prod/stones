import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Earth } from './components/Earth'
import { Markers } from './components/Markers'
import { CameraController } from './components/CameraController'
import { UIOverlay } from './components/UIOverlay'
import { AboutSection } from './components/AboutSection'
import { ProductListSection } from './components/ProductListSection'
import { LocationInfoSection } from './components/LocationInfoSection'
import { LoadingScreen } from './components/LoadingScreen'
import { AdminLayout } from './admin/components/AdminLayout'
import { Dashboard } from './admin/pages/Dashboard'
import { Locations } from './admin/pages/Locations'
import { Products } from './admin/pages/Products'
import { useStore } from './store'

function Scene() {
  const selectedLocation = useStore((state) => state.selectedLocation)

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 3, 2]} intensity={2} />

      <group>
        <Earth />
        <Markers />
      </group>

      <CameraController />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        rotateSpeed={0.5}
        autoRotate={!selectedLocation}
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

function MainApp() {
  const fetchLocations = useStore((state) => state.fetchLocations)
  const selectedLocation = useStore((state) => state.selectedLocation)
  const [showOverview, setShowOverview] = React.useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    if (selectedLocation) {
      // When entering a location
      setShowOverview(false)
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      // When returning to orbit
      window.scrollTo({ top: 0, behavior: 'instant' }); // Instant scroll to top
      // Delay showing About text so it fades/appears nicely after zoom out starts
      const timer = setTimeout(() => setShowOverview(true), 600);
      return () => clearTimeout(timer);
    }
  }, [selectedLocation])

  return (
    <div className="relative w-full min-h-screen bg-black">
      <LoadingScreen />

      <div className="fixed inset-0 z-0">
        <ErrorBoundary>
          <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      <div className="relative z-10 pointer-events-none">
        <UIOverlay />

        {!selectedLocation && <div className="h-screen pointer-events-none" />}

        {selectedLocation ? (
          <>
            <LocationInfoSection />
            <ProductListSection />
          </>
        ) : (
          showOverview && <AboutSection /> // Only show after delay
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="locations" element={<Locations />} />
          <Route path="products" element={<Products />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
