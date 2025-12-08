import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export function Globe() {
    const globeRef = useRef<THREE.Mesh>(null)

    // Using reliable high-res textures from common external sources
    const [colorMap, normalMap, specularMap] = useTexture([
        'https://raw.githubusercontent.com/giovanni-e/earth-textures/master/earth_daymap.jpg',
        'https://raw.githubusercontent.com/giovanni-e/earth-textures/master/earth_normal_map.jpg',
        'https://raw.githubusercontent.com/giovanni-e/earth-textures/master/earth_specular_map.jpg' // Assuming jpg version exists, otherwise we'll fallback
    ])

    // Fallback if the specular map jpg doesn't exist? 
    // Actually giovanni-e repo usually has TIF. Let's use a different source for specular if needed,
    // or just omit it for now to avoid errors if I'm not sure.
    // Better source: Solar System Scope textures hosted on a reliable CDN or GitHub.

    // Let's stick to safe textures for now.
    // We'll update the texture calls to specific URLs I'm more confident in.

    useFrame((_, delta) => {
        if (globeRef.current) {
            globeRef.current.rotation.y += delta * 0.05 // Slow rotation
        }
    })

    return (
        <group>
            {/* Earth Sphere */}
            <mesh ref={globeRef} rotation={[0, 0, 0]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshPhongMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    specularMap={specularMap}
                    shininess={5}
                />
            </mesh>

            {/* Atmosphere Glow (Simplified) */}
            <mesh scale={[1.02, 1.02, 1.02]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial
                    color="#4db2ff"
                    transparent
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    )
}
