import type { Location } from '../data/db'
import { useStore } from '../store'
import * as THREE from 'three'
import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Billboard, Html } from '@react-three/drei'

// Geometry for the flat circle (2D billboard)
const markerGeometry = new THREE.CircleGeometry(0.02, 16)
const defaultMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.8 })
const hoveredMaterial = new THREE.MeshBasicMaterial({ color: '#ffaa00', transparent: true, opacity: 1 })
const selectedMaterial = new THREE.MeshBasicMaterial({ color: '#ff0000', transparent: true, opacity: 1 })

export function Markers() {
    const selectLocation = useStore((state) => state.selectLocation)
    const selectedLocation = useStore((state) => state.selectedLocation)
    const locations = useStore((state) => state.locations)

    return (
        <group>
            {locations.map((loc) => (
                <Marker
                    key={loc.id}
                    location={loc}
                    onClick={() => selectLocation(loc)}
                    isSelected={selectedLocation?.id === loc.id}
                />
            ))}
        </group>
    )
}

const Marker = React.memo(function Marker({
    location,
    onClick,
    isSelected
}: {
    location: Location,
    onClick: () => void,
    isSelected: boolean
}) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [hovered, setHover] = useState(false)

    // Calculate position on sphere
    const position = useMemo(() => {
        const phi = (90 - location.lat) * (Math.PI / 180)
        const theta = (location.lng + 180) * (Math.PI / 180)
        const radius = 1.02 // Slightly above surface

        const x = -(radius * Math.sin(phi) * Math.cos(theta))
        const z = (radius * Math.sin(phi) * Math.sin(theta))
        const y = (radius * Math.cos(phi))

        return new THREE.Vector3(x, y, z)
    }, [location.lat, location.lng])

    useEffect(() => {
        if (meshRef.current) {
            const scale = isSelected || hovered ? 1.5 : 1
            meshRef.current.scale.setScalar(scale)
        }
    }, [isSelected, hovered])

    const material = isSelected ? selectedMaterial : (hovered ? hoveredMaterial : defaultMaterial)

    return (
        <group position={position}>
            {/* Billboard ensures the flat circle always faces the camera */}
            <Billboard>
                <mesh
                    ref={meshRef}
                    geometry={markerGeometry}
                    material={material}
                    onClick={(e) => { e.stopPropagation(); onClick() }}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                />
            </Billboard>

            {/* Tooltip on hover */}
            {hovered && !isSelected && (
                <Html position={[0, 0.05, 0]} center pointerEvents="none">
                    <div className="px-2 py-1 bg-black/80 text-white text-xs rounded border border-white/20 whitespace-nowrap backdrop-blur-sm">
                        {location.name}
                    </div>
                </Html>
            )}
        </group>
    )
})
