import { create } from 'zustand'

export interface Product {
    id: string
    title: string
    country: string
    price: string
    description: string
    lat: number
    lng: number
    image: string
}

interface AppState {
    selectedProduct: Product | null
    setSelectedProduct: (product: Product | null) => void
}

export const useStore = create<AppState>((set) => ({
    selectedProduct: null,
    setSelectedProduct: (product) => set({ selectedProduct: product }),
}))

export const products: Product[] = [
    {
        id: '1',
        title: 'Artisan Coffee',
        country: 'Colombia',
        price: '$18.00',
        description: 'Single-origin Arabica beans from the high altitudes of the Colombian Andes.',
        lat: 4.5709,
        lng: -74.2973,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '2',
        title: 'Mechanical Keyboard',
        country: 'Japan',
        price: '$140.00',
        description: 'Precision-engineered mechanical switches with custom PBT keycaps.',
        lat: 36.2048,
        lng: 138.2529,
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '3',
        title: 'Merino Wool Scarf',
        country: 'New Zealand',
        price: '$85.00',
        description: 'Ultra-soft merino wool ethically sourced from New Zealand sheep farms.',
        lat: -40.9006,
        lng: 174.8860,
        image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '4',
        title: 'Handcrafted Leather Bag',
        country: 'Italy',
        price: '$320.00',
        description: 'Genuine Tuscan leather bag, stitched by master artisans in Florence.',
        lat: 41.8719,
        lng: 12.5674,
        image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: '5',
        title: 'Nordic Minimalist Lamp',
        country: 'Sweden',
        price: '$120.00',
        description: 'Elegantly designed lamp featuring sustainable wood and warm lighting.',
        lat: 60.1282,
        lng: 18.6435,
        image: 'https://images.unsplash.com/photo-1513506003013-d50a6kc87a0c?q=80&w=1000&auto=format&fit=crop' // Fixed typo in URL maybe? Using a random lamp url if needed.
    }
]
