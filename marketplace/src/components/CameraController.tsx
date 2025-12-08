import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { easing } from 'maath'

export function CameraController() {
    const selectedLocation = useStore((state) => state.selectedLocation)
    const viewMode = useStore((state) => state.viewMode)

    useFrame((state, delta) => {
        if (selectedLocation) {
            // Rotate to face location, but keep distance
            const phi = (90 - selectedLocation.lat) * (Math.PI / 180)
            const theta = (selectedLocation.lng + 180) * (Math.PI / 180)
            const distance = 3.5 // Keep original distance (no zoom in)

            const x = -(distance * Math.sin(phi) * Math.cos(theta))
            const z = (distance * Math.sin(phi) * Math.sin(theta))
            const y = (distance * Math.cos(phi))

            const targetPos = new THREE.Vector3(x, y, z)

            // Smoothly move camera
            easing.damp3(state.camera.position, targetPos, 0.5, delta)
            state.camera.lookAt(0, 0, 0)
        } else {
            // If nothing selected, maybe just let it float or return to default?
            // Since autoRotate is on in OrbitControls, we might not need to force position if not selected.
            // But if we want to reset:
            /*
           if (state.camera.position.length() < 3.4) {
               const targetPos = state.camera.position.clone().normalize().multiplyScalar(3.5)
               easing.damp3(state.camera.position, targetPos, 1.5, delta)
           }
           */
        }
    })

    return null
}
