export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    level: 1 | 2 | 3;
}

export interface Location {
    id: string;
    name: string;
    country: string;
    lat: number;
    lng: number;
    image?: string;
    description?: string;
    products: Product[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    orders: string[];
}

export const PRODUCTS: Product[] = [
    {
        id: 'p1',
        name: 'Rare Blue Gem',
        description: 'A stunning blue gemstone found in the deep mines.',
        price: 1200,
        image: 'https://placehold.co/400x300/0000ff/ffffff?text=Blue+Gem',
        category: 'Gemstones',
        level: 2
    },
    {
        id: 'p2',
        name: 'Ancient Artifact',
        description: 'A mysterious artifact from a lost civilization.',
        price: 5000,
        image: 'https://placehold.co/400x300/aa0000/ffffff?text=Artifact',
        category: 'Artifacts',
        level: 3
    },
    {
        id: 'p3',
        name: 'Exotic Spice',
        description: 'Rare spices harvested from the highest peaks.',
        price: 200,
        image: 'https://placehold.co/400x300/ffff00/000000?text=Spice',
        category: 'Spices',
        level: 1
    },
    {
        id: 'p4',
        name: 'Handcrafted Vase',
        description: 'Delicate vase made by master potters.',
        price: 800,
        image: 'https://placehold.co/400x300/00ff00/000000?text=Vase',
        category: 'Ceramics',
        level: 1
    },
    {
        id: 'p5',
        name: 'Golden Statue',
        description: 'A solid gold statue of a deity.',
        price: 15000,
        image: 'https://placehold.co/400x300/ffd700/000000?text=Gold',
        category: 'Art',
        level: 3
    }
];

export const LOCATIONS: Location[] = [
    {
        id: 'l1',
        name: 'Crystal Caves',
        country: 'Iceland',
        lat: 64.9631,
        lng: -19.0208,
        image: '/locations/crystal_caves.jpg',
        description: 'Glimmering subterranean caverns filled with rare minerals and bioluminescent flora.',
        products: [PRODUCTS[0]]
    },
    {
        id: 'l2',
        name: 'Sahara Outpost',
        country: 'Egypt',
        lat: 26.8206,
        lng: 30.8025,
        image: '/locations/sahara_outpost.jpg',
        description: 'A remote trading station amidst the endless dunes, known for ancient relics.',
        products: [PRODUCTS[1], PRODUCTS[4]]
    },
    {
        id: 'l3',
        name: 'Himalayan Peaks',
        country: 'Nepal',
        lat: 28.3949,
        lng: 84.1240,
        image: '/locations/himalayan_peaks.jpg',
        description: 'The roof of the world, where rare spices and spiritual artifacts are found.',
        products: [PRODUCTS[2]]
    },
    {
        id: 'l4',
        name: 'Kyoto Village',
        country: 'Japan',
        lat: 35.0116,
        lng: 135.7681,
        image: '/locations/kyoto_village.jpg',
        description: 'A traditional village preserving centuries-old craftsmanship and ceramics.',
        products: [PRODUCTS[3]]
    },
    {
        id: 'l5',
        name: 'Amazon Rainforest',
        country: 'Brazil',
        lat: -3.4653,
        lng: -62.2159,
        image: '/locations/amazon_rainforest.jpg',
        description: 'A dense, vibrant jungle teeming with exotic life and hidden treasures.',
        products: [PRODUCTS[2], PRODUCTS[0]]
    }
];

export const MOCK_USER: User = {
    id: 'u1',
    name: 'Explorer One',
    email: 'explorer@example.com',
    orders: []
};
