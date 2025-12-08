import { create } from 'zustand';
import { MOCK_USER } from './data/db';
import type { Location, User, Product } from './data/db';

interface AppState {
    viewMode: 'WORLD' | 'LOCATION';
    activeView: 'MARKET' | 'ACCOUNT' | 'CART';
    selectedLocation: Location | null;
    user: User;
    cart: Product[];
    locations: Location[];
    isLoading: boolean;

    // Actions
    selectLocation: (location: Location) => void;
    clearSelection: () => void;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    setActiveView: (view: 'MARKET' | 'ACCOUNT' | 'CART') => void;
    fetchLocations: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
    viewMode: 'WORLD',
    activeView: 'MARKET',
    selectedLocation: null,
    user: MOCK_USER,
    cart: [],
    locations: [],
    isLoading: false,

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
            const data = await res.json();
            set({ locations: data, isLoading: false });
        } catch (error) {
            console.error(error);
            set({ isLoading: false });
        }
    }
}));
