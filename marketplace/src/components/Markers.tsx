import type { Location } from '../data/db'
import { useStore } from '../store'
import * as THREE from 'three'
import { useState } from 'react'

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

function Marker({ location, onClick, isSelected }: { location: Location, onClick: () => void, isSelected: boolean }) {
    const [hovered, setHover] = useState(false)

    // Convert Lat/Lng to 3D position
    // Lat: 90 (North) to -90 (South) -> Phi: 0 to 180
    // Lng: -180 to 180 -> Theta: 0 to 360
    const phi = (90 - location.lat) * (Math.PI / 180)
    const theta = (location.lng + 180) * (Math.PI / 180)
    const radius = 1.02 // Slightly above surface

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = (radius * Math.sin(phi) * Math.sin(theta))
    const y = (radius * Math.cos(phi))

    // Scale marker on hover or selection
    const scale = isSelected || hovered ? 1.5 : 1

    return (
        <mesh
            position={[x, y, z]}
            onClick={(e) => { e.stopPropagation(); onClick() }}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
            scale={scale}
        >
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color={isSelected ? "#ff0000" : (hovered ? "#ffaa00" : "#ffffff")} />
        </mesh>
    )
}
