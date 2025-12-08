import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { easing } from 'maath'

export function CameraController() {
    const selectedProduct = useStore((state) => state.selectedProduct)

    useFrame((state, delta) => {
        // If a product is selected, zoom in to it
        if (selectedProduct) {
            // Calculate target position based on product lat/lng
            // We want to be slightly above the surface at the location
            const phi = (90 - selectedProduct.lat) * (Math.PI / 180)
            const theta = (selectedProduct.lng + 180) * (Math.PI / 180)

            // Target camera distance from center (radius 1 + distance)
            const distance = 1.8

            const x = -(distance * Math.sin(phi) * Math.cos(theta))
            const z = (distance * Math.sin(phi) * Math.sin(theta))
            const y = (distance * Math.cos(phi))

            const targetPos = new THREE.Vector3(x, y, z)

            // Smoothly animate camera position
            easing.damp3(state.camera.position, targetPos, 0.5, delta)

            // Make camera look at the center of the earth (or slightly offset if needed)
            // For simple earth zoom, looking at 0,0,0 is usually fine if we position camera strictly radially.
            // But to make it seamless with OrbitControls which looks at 0,0,0, we keep looking at 0,0,0.
            // However, OrbitControls controls the camera too. We might need to disable OrbitControls or manipulate its target.
            // For this demo, let's assume we fight OrbitControls or assume it's disabled when locked.
            // Better approach: Update the OrbitControls target if possible, or just force camera lookAt if OrbitControls is disabled.

            state.camera.lookAt(0, 0, 0)
        } else {
            // If nothing selected, maybe return to a default orbit or just let OrbitControls handle it?
            // If we just release control, OrbitControls takes over from where we left off.
            // But we might want to zoom out.

            // Check if we are too close, if so zoom out
            if (state.camera.position.length() < 2.5) {
                // Basic zoom out logic to a default orbit distance
                const currentPos = state.camera.position.clone().normalize().multiplyScalar(3.5)
                easing.damp3(state.camera.position, currentPos, 0.5, delta)
                state.camera.lookAt(0, 0, 0)
            }
        }
    })

    return null
}
