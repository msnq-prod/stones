import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { easing } from 'maath'

export function CameraController() {
    const selectedLocation = useStore((state) => state.selectedLocation)
    const viewMode = useStore((state) => state.viewMode)

    useFrame((state, delta) => {
        if (selectedLocation && viewMode === 'LOCATION') {
            // Zoom to location
            const phi = (90 - selectedLocation.lat) * (Math.PI / 180)
            const theta = (selectedLocation.lng + 180) * (Math.PI / 180)
            const distance = 1.6 // Zoom level

            const x = -(distance * Math.sin(phi) * Math.cos(theta))
            const z = (distance * Math.sin(phi) * Math.sin(theta))
            const y = (distance * Math.cos(phi))

            const targetPos = new THREE.Vector3(x, y, z)

            // Smoothly move camera
            easing.damp3(state.camera.position, targetPos, 0.5, delta)

            // Ensure camera looks at center
            state.camera.lookAt(0, 0, 0)
        } else {
            // Default orbit position (if returning from zoom)
            // Ideally we'd let orbit controls handle this, but for smooth transition back:
            if (state.camera.position.length() < 2.5) {
                const targetPos = state.camera.position.clone().normalize().multiplyScalar(3.5)
                easing.damp3(state.camera.position, targetPos, 1.5, delta)
                state.camera.lookAt(0, 0, 0)
            }
        }
    })

    return null
}
