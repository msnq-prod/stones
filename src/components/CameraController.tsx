import { useFrame } from '@react-three/fiber'
import React from 'react'
import * as THREE from 'three'
import { useStore } from '../store'
import { easing } from 'maath'

export function CameraController() {
    const selectedLocation = useStore((state) => state.selectedLocation)
    const targetPositionRef = React.useRef(new THREE.Vector3())
    const zoomOutDirectionRef = React.useRef(new THREE.Vector3())

    useFrame((state, delta) => {
        if (selectedLocation) {
            // Rotate to face location, but keep distance
            const phi = (90 - selectedLocation.lat) * (Math.PI / 180)
            const theta = (selectedLocation.lng + 180) * (Math.PI / 180)
            const distance = 2.0 // Zoom level
            const x = -(distance * Math.sin(phi) * Math.cos(theta))
            const z = (distance * Math.sin(phi) * Math.sin(theta))
            const y = (distance * Math.cos(phi))

            targetPositionRef.current.set(x, y, z)

            // Check if camera is already at target (optimization)
            if (state.camera.position.distanceToSquared(targetPositionRef.current) < 0.0001) return

            // Smoothly move camera
            easing.damp3(state.camera.position, targetPositionRef.current, 0.5, delta)
            state.camera.lookAt(0, 0, 0) // Ensure camera always faces center
        } else {
            // Return to orbit distance if too close
            const currentDist = state.camera.position.length()
            if (currentDist < 3.4) {
                // Smoothly zoom out to radius 3.5
                zoomOutDirectionRef.current.copy(state.camera.position).normalize().multiplyScalar(3.5)
                easing.damp3(state.camera.position, zoomOutDirectionRef.current, 0.5, delta)
                state.camera.lookAt(0, 0, 0)
            }
        }

    })

    return null
}
