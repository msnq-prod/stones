import { create } from 'zustand'
import type { Location, Item } from './data'

interface AppState {
    selectedLocation: Location | null
    setSelectedLocation: (location: Location | null) => void
}

export const useStore = create<AppState>((set) => ({
    selectedLocation: null,
    setSelectedLocation: (location) => set({ selectedLocation: location }),
}))

export type { Location, Item }

