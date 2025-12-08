import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { Billboard } from '@react-three/drei'
import { products, useStore } from '../store'

// Helper to convert Lat/Lng to Vector3 on a sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = (radius * Math.sin(phi) * Math.sin(theta))
    const y = (radius * Math.cos(phi))

    return new THREE.Vector3(x, y, z)
}

function Marker({ product, radius }: { product: typeof products[0], radius: number }) {
    const position = useMemo(() => latLngToVector3(product.lat, product.lng, radius), [product, radius])
    const setSelectedProduct = useStore((state) => state.setSelectedProduct)
    const [hovered, setHovered] = useState(false)

    return (
        <group position={position}>
            <mesh
                onClick={(e) => {
                    e.stopPropagation() // Prevent click from passing through to globe
                    setSelectedProduct(product)
                }}
                onPointerOver={() => {
                    setHovered(true)
                    document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                    setHovered(false)
                    document.body.style.cursor = 'auto'
                }}
            >
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshBasicMaterial color={hovered ? "#ffaa00" : "#ffffff"} />
            </mesh>

            {/* Optional glow ring */}
            <Billboard>
                <mesh scale={[1.5, 1.5, 1.5]}>
                    <ringGeometry args={[0.03, 0.04, 32]} />
                    <meshBasicMaterial color={hovered ? "#ffaa00" : "#ffffff"} side={THREE.DoubleSide} transparent opacity={0.6} />
                </mesh>
            </Billboard>
        </group>
    )
}

export function Markers() {
    // Radius should match the Sphere radius in Globe.tsx (which is 1)
    const radius = 1.01 // Slightly above surface

    return (
        <group>
            {products.map((product) => (
                <Marker key={product.id} product={product} radius={radius} />
            ))}
        </group>
    )
}
