import { create } from 'zustand';
import { MOCK_USER, LOCATIONS } from './data/db';
import type { Location, User, Product } from './data/db';

interface AppState {
    viewMode: 'WORLD' | 'LOCATION';
    activeView: 'MARKET' | 'ACCOUNT' | 'CART' | 'MUSEUMS' | 'CONTACTS' | 'PRODUCTS';
    selectedLocation: Location | null;
    user: User;
    cart: Product[];
    locations: Location[];
    isLoading: boolean;
    language: number;

    // Actions
    selectLocation: (location: Location) => void;
    clearSelection: () => void;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    setActiveView: (view: 'MARKET' | 'ACCOUNT' | 'CART' | 'MUSEUMS' | 'CONTACTS' | 'PRODUCTS') => void;
    fetchLocations: () => Promise<void>;
    setLanguage: (langId: number) => void;
}

export const useStore = create<AppState>((set) => ({
    viewMode: 'WORLD',
    activeView: 'MARKET',
    selectedLocation: null,
    user: MOCK_USER,
    cart: [],
    locations: [],
    isLoading: false,
    language: 2, // Default to Russian (ID 2 assumed from seed)
    setLanguage: (language) => set({ language }),

    selectLocation: (location) => set({
        selectedLocation: location,
        viewMode: 'LOCATION',
        activeView: 'MARKET'
    }),

    clearSelection: () => set({
        selectedLocation: null,
        viewMode: 'WORLD',
        activeView: 'MARKET'
    }),

    addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),
    removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(p => p.id !== id) })),
    setActiveView: (view) => set({ activeView: view }),

    fetchLocations: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/locations');
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            set({ locations: data, isLoading: false });
        } catch (error) {
            console.error('API unavailable, using mock data:', error);
            // Fallback to mock locations when API is unavailable
            set({ locations: LOCATIONS, isLoading: false });
        }
    }
}));
