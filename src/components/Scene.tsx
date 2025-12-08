import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Globe } from './Globe'
import { Starfield } from './Starfield'
import { Markers } from './Markers'
import { CameraController } from './CameraController'
import { useStore } from '../store'

export function Scene() {
    const selectedProduct = useStore((state) => state.selectedProduct)

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 3.5]} />
            <CameraController />
            <OrbitControls
                enablePan={false}
                enableZoom={!selectedProduct} // Disable zoom when locked
                enableRotate={!selectedProduct} // Disable rotate when locked
                minDistance={1.5}
                maxDistance={10}
                rotateSpeed={0.5}
            />

            {/* Ambient Light */}
            <ambientLight intensity={0.5} color="#ffffff" />

            {/* Directional Light (Sun) */}
            <directionalLight position={[5, 3, 5]} intensity={2.5} />

            {/* Components */}
            <Globe />
            <Markers />
            <Starfield />

            {/* Environment for better reflections if needed, or just simple lights */}
            {/* <Environment preset="city" /> */}
        </>
    )
}
