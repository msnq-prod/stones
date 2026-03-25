import React from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

export function Earth() {
    const selectedLocation = useStore((state) => state.selectedLocation)
    const clearSelection = useStore((state) => state.clearSelection)

    const [colorMap, normalMap] = useTexture(
        [
            '/textures/earth_daymap.jpg',
            '/textures/earth_normal_map.jpg'
        ],
        ([loadedColorMap]) => {
            loadedColorMap.colorSpace = THREE.SRGBColorSpace
            loadedColorMap.needsUpdate = true
        }
    )

    // Rotation is now handled by OrbitControls autoRotate in App.tsx to ensure sync with markers
    // useFrame((_, delta) => {
    //     if (globeRef.current && viewMode === 'WORLD') {
    //         globeRef.current.rotation.y += delta * 0.05
    //     }
    // })

    return (
        <group>
            {/* Earth Sphere */}
            <mesh
                rotation={[0, 0, 0]}
                onClick={(event) => {
                    if (!selectedLocation) return

                    event.stopPropagation()
                    clearSelection()
                }}
            >
                <sphereGeometry args={[1, 24, 24]} />
                <meshStandardMaterial
                    map={colorMap}
                    normalMap={normalMap}
                    emissiveMap={colorMap}
                    emissive="#1b2533"
                    emissiveIntensity={0.18}
                    metalness={0.1}
                    roughness={0.7}
                />
            </mesh>

            {/* Atmosphere Glow (Sprite behind the planet) */}
            <AtmosphereSprite />
        </group>
    )
}

function AtmosphereSprite() {
    // Generate glow texture only once
    const texture = React.useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const context = canvas.getContext('2d')!

        const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128)

        // Scale 2.5 -> Radius 1.25. Surface (R=1) is at 1/1.25 = 0.8

        // Core (hidden)
        gradient.addColorStop(0, 'rgba(77, 178, 255, 1)')
        gradient.addColorStop(0.75, 'rgba(77, 178, 255, 1)')

        // Surface start - softer, natural blue
        gradient.addColorStop(0.8, 'rgba(100, 200, 255, 0.5)')

        // Fast fade out for thin atmosphere
        gradient.addColorStop(0.9, 'rgba(100, 200, 255, 0.1)')
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')

        context.fillStyle = gradient
        context.fillRect(0, 0, 256, 256)

        const atmosphereTexture = new THREE.CanvasTexture(canvas)
        atmosphereTexture.generateMipmaps = false
        atmosphereTexture.minFilter = THREE.LinearFilter
        atmosphereTexture.magFilter = THREE.LinearFilter

        return atmosphereTexture
    }, [])

    React.useEffect(() => {
        return () => {
            texture.dispose()
        }
    }, [texture])

    return (
        <sprite scale={[2.5, 2.5, 1]}>
            <spriteMaterial
                map={texture}
                transparent
                opacity={0.6} // Reduced global opacity for subtlety
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </sprite>
    )
}
