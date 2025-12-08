export interface Item {
    id: string
    title: string
    price: string
    description: string
    image: string
}

export interface Location {
    id: string
    title: string
    country: string
    lat: number
    lng: number
    items: Item[]
}

export const locations: Location[] = [
    {
        id: '1',
        title: 'Andean Coffee Region',
        country: 'Colombia',
        lat: 4.5709,
        lng: -74.2973,
        items: [
            {
                id: '1-1',
                title: 'Highland Arabica Beans',
                price: '$18.00',
                description: 'Single-origin Arabica beans grown in the volcanic soil of the Andes.',
                image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop'
            },
            {
                id: '1-2',
                title: 'Traditional Coffee Pot',
                price: '$45.00',
                description: 'Hand-crafted copper coffee pot used by local farmers.',
                image: 'https://images.unsplash.com/photo-1550954006-25916ea33446?q=80&w=1000&auto=format&fit=crop' // Placeholder
            },
            {
                id: '1-3',
                title: 'Coffee Blossom Honey',
                price: '$12.00',
                description: 'Rare honey harvested during the coffee blossom season.',
                image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=1000&auto=format&fit=crop' // Placeholder
            }
        ]
    },
    {
        id: '2',
        title: 'Tokyo Electronics District',
        country: 'Japan',
        lat: 35.6895,
        lng: 139.6917,
        items: [
            {
                id: '2-1',
                title: 'Custom Mechanical Keyboard',
                price: '$240.00',
                description: 'Precision-engineered mechanical switches with custom PBT keycaps.',
                image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop'
            },
            {
                id: '2-2',
                title: 'Vintage Film Camera',
                price: '$450.00',
                description: 'Restored 35mm film camera from the golden age of photography.',
                image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop'
            }
        ]
    },
    {
        id: '3',
        title: 'Tuscan Leather Workshops',
        country: 'Italy',
        lat: 43.7696,
        lng: 11.2558,
        items: [
            {
                id: '3-1',
                title: 'Handcrafted Satchel',
                price: '$320.00',
                description: 'Genuine vegetable-tanned leather bag, stitched by master artisans.',
                image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=1000&auto=format&fit=crop'
            },
            {
                id: '3-2',
                title: 'Leather Journal',
                price: '$45.00',
                description: 'Refillable leather notebook cover with premium paper.',
                image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000&auto=format&fit=crop'
            }
        ]
    },
    {
        id: '4',
        title: 'Nordic Design Studio',
        country: 'Sweden',
        lat: 59.3293,
        lng: 18.0686,
        items: [
            {
                id: '5',
                title: 'Nordic Minimalist Lamp',
                price: '$120.00',
                description: 'Elegantly designed lamp featuring sustainable wood and warm lighting.',
                image: 'https://images.unsplash.com/photo-1513506003013-d50a6kc87a0c?q=80&w=1000&auto=format&fit=crop'
            }
        ]
    }
]
