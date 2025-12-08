import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

export function Earth() {
    const globeRef = useRef<THREE.Mesh>(null)
    const viewMode = useStore((state) => state.viewMode)

    useFrame((_, delta) => {
        if (globeRef.current && viewMode === 'WORLD') {
            globeRef.current.rotation.y += delta * 0.05
        }
    })

    return (
        <group>
            {/* Simple Earth Sphere with solid color */}
            <mesh ref={globeRef} rotation={[0, 0, 0]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial color="#2a7ae2" metalness={0.1} roughness={0.7} />
            </mesh>
            {/* Atmosphere Glow */}
            <mesh scale={[1.02, 1.02, 1.02]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial color="#4db2ff" transparent opacity={0.1} side={THREE.BackSide} />
            </mesh>
        </group>
    )
}
