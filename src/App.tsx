import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import React, { Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import * as THREE from 'three'
import { Earth } from './components/Earth'
import { Markers } from './components/Markers'
import { CameraController } from './components/CameraController'
import { UIOverlay } from './components/UIOverlay'
import { AboutSection } from './components/AboutSection'
import { ProductListSection } from './components/ProductListSection'
import { LocationInfoSection } from './components/LocationInfoSection'
import { LoadingScreen } from './components/LoadingScreen'
import { ScrollToProductsHint } from './components/ScrollToProductsHint'
import { AdminLayout } from './admin/components/AdminLayout'
import { Dashboard } from './admin/pages/Dashboard'
import { Locations } from './admin/pages/Locations'
import { Products } from './admin/pages/Products'
import { useStore } from './store'

const INITIAL_CAMERA_POSITION: [number, number, number] = [
  -1.7057780567874519,
  2.3921494680329234,
  -1.902088889503387
]

const LIGHT_START_LONGITUDE = -40.35
const LIGHT_ORBIT_RADIUS = 12
const LIGHT_ORBIT_HEIGHT = 3.5
const LIGHT_ORBIT_SPEED = 0.08
const MAIN_SCENE_DPR: [number, number] = [1, 1.25]
const MAIN_SCENE_FPS = 30

function OrbitingSunLight() {
  const lightRef = React.useRef<THREE.DirectionalLight>(null)

  useFrame(({ clock }) => {
    if (!lightRef.current) return

    const angle = ((LIGHT_START_LONGITUDE + 180) * Math.PI) / 180 + clock.getElapsedTime() * LIGHT_ORBIT_SPEED
    const x = -LIGHT_ORBIT_RADIUS * Math.cos(angle)
    const z = LIGHT_ORBIT_RADIUS * Math.sin(angle)

    lightRef.current.position.set(x, LIGHT_ORBIT_HEIGHT, z)
  })

  return <directionalLight ref={lightRef} intensity={2.4} />
}

function SceneRenderTicker({ fps }: { fps: number }) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    const frameDuration = 1000 / fps
    let animationFrameId = 0
    let timeoutId: number | undefined

    const scheduleNextFrame = () => {
      timeoutId = window.setTimeout(() => {
        animationFrameId = window.requestAnimationFrame(() => {
          if (!document.hidden) {
            invalidate()
          }

          scheduleNextFrame()
        })
      }, frameDuration)
    }

    invalidate()
    scheduleNextFrame()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [fps, invalidate])

  return null
}

function Scene() {
  const selectedLocation = useStore((state) => state.selectedLocation)
  const clearSelection = useStore((state) => state.clearSelection)

  return (
    <>
      <ambientLight intensity={0.35} />
      <OrbitingSunLight />

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
        autoRotateSpeed={0.15}
        onStart={() => {
          if (useStore.getState().selectedLocation) {
            clearSelection()
          }
        }}
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="text-white p-10 text-center"><h1>Произошла ошибка.</h1><button onClick={() => window.location.reload()} className="bg-blue-500 px-4 py-2 mt-4 rounded">Перезагрузить</button></div>;
    }

    return this.props.children;
  }
}

function MainApp() {
  const fetchLocations = useStore((state) => state.fetchLocations)
  const selectedLocation = useStore((state) => state.selectedLocation)
  const [showOverviewDelayed, setShowOverviewDelayed] = React.useState(true)

  useEffect(() => {
    void fetchLocations()
  }, [fetchLocations])

  useEffect(() => {
    if (selectedLocation) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      // keep update async to avoid synchronous setState in effect
      const timer = setTimeout(() => setShowOverviewDelayed(false), 0)
      return () => clearTimeout(timer)
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
      // Delay showing About text so it fades/appears nicely after zoom out starts
      const timer = setTimeout(() => setShowOverviewDelayed(true), 600)
      return () => clearTimeout(timer)
    }
  }, [selectedLocation])

  return (
    <div className="relative w-full min-h-screen bg-black">
      <LoadingScreen />

      <div className="fixed inset-0 z-0">
        <ErrorBoundary>
          <Canvas
            camera={{ position: INITIAL_CAMERA_POSITION, fov: 45, near: 0.1, far: 20 }}
            dpr={MAIN_SCENE_DPR}
            frameloop="demand"
            gl={{ antialias: true, powerPreference: 'low-power', stencil: false }}
            performance={{ min: 0.75 }}
          >
            <SceneRenderTicker fps={MAIN_SCENE_FPS} />
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      <div className="relative z-10 pointer-events-none">
        <UIOverlay />
        <ScrollToProductsHint />

        {!selectedLocation && <div className="h-screen pointer-events-none" />}

        {selectedLocation ? (
          <>
            <LocationInfoSection />
            <ProductListSection />
          </>
        ) : (
          showOverviewDelayed && <AboutSection /> // Only show after delay
        )}
      </div>
    </div>
  )
}

import { PartnerLayout } from './partner/components/PartnerLayout'
import { Login as PartnerLogin } from './partner/pages/Login'
import { Dashboard as PartnerDashboard } from './partner/pages/Dashboard'
import { Batches as PartnerBatches } from './partner/pages/Batches'
import { CreateBatch } from './partner/pages/CreateBatch'
import { QrCenter } from './partner/pages/QrCenter'
import { QrPrint } from './partner/pages/QrPrint'
import { Finance } from './partner/pages/Finance'
import { Acceptance } from './admin/pages/Acceptance'
import { Allocation } from './admin/pages/Allocation'
import { Users } from './admin/pages/Users'
import { DigitalClone } from './public/pages/DigitalClone'
import { CloneContent } from './admin/pages/CloneContent'
import { Warehouse } from './admin/pages/Warehouse'
import { Orders } from './admin/pages/Orders'

function App() {
  return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/clone/:publicToken" element={<DigitalClone />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<PartnerLogin portal="admin" />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="locations" element={<Locations />} />
          <Route path="products" element={<Products />} />
          <Route path="acceptance" element={<Acceptance />} />
          <Route path="allocation" element={<Allocation />} />
          <Route path="warehouse" element={<Warehouse />} />
          <Route path="users" element={<Users />} />
          <Route path="clone-content" element={<CloneContent />} />
        </Route>

        {/* Partner Routes */}
        <Route path="/partner" element={<PartnerLayout />}>
          <Route path="login" element={<PartnerLogin portal="partner" />} />
          <Route path="dashboard" element={<PartnerDashboard />} />
          <Route path="batches" element={<PartnerBatches />} />
          <Route path="batches/new" element={<CreateBatch />} />
          <Route path="qr" element={<QrCenter />} />
          <Route path="qr/print" element={<QrPrint />} />
          <Route path="finance" element={<Finance />} />
          <Route index element={<PartnerDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App
