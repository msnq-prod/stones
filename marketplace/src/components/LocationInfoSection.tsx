import { motion } from 'framer-motion';
import { useStore } from '../store';

export function LocationInfoSection() {
    const selectedLocation = useStore((state) => state.selectedLocation);

    if (!selectedLocation) return null;

    return (
        <section className="relative z-10 w-full text-white py-20 px-6 pointer-events-auto">
            <div className="max-w-4xl mx-auto text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-light mb-4"
                >
                    {selectedLocation.name}
                </motion.h2>
                <div className="flex flex-col items-center gap-4">
                    <p className="text-xl text-blue-400 font-mono tracking-widest uppercase">{selectedLocation.country}</p>
                    <div className="flex gap-4 text-xs text-gray-500 font-mono">
                        <span>LAT: {selectedLocation.lat.toFixed(4)}</span>
                        <span>LNG: {selectedLocation.lng.toFixed(4)}</span>
                    </div>
                </div>
                {/* Add a description mock if not in DB yet, or use what we have */}
                <p className="mt-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
                    Discover rare artifacts and resources unique to this region.
                    Our local partners ensure every item is ethically sourced and verified for authenticity.
                </p>
            </div>
        </section>
    );
}
