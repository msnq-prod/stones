import { motion } from 'framer-motion'
import { useStore } from '../../store'

export function ProductCard() {
    const selectedProduct = useStore((state) => state.selectedProduct)
    const setSelectedProduct = useStore((state) => state.setSelectedProduct)

    if (!selectedProduct) return null

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute top-0 right-0 h-full w-full md:w-1/3 bg-black/80 backdrop-blur-md text-white border-l border-white/10 p-8 flex flex-col pointer-events-auto"
        >
            <button
                onClick={() => setSelectedProduct(null)}
                className="self-end text-white/50 hover:text-white mb-6 uppercase tracking-widest text-sm transition-colors"
            >
                [ Close ]
            </button>

            <div className="flex-1 overflow-y-auto pr-2">
                <h2 className="text-4xl font-bold mb-2 font-display">{selectedProduct.title}</h2>
                <div className="flex items-center text-sm font-mono text-blue-400 mb-6 space-x-4">
                    <span>// {selectedProduct.country.toUpperCase()}</span>
                    <span>{selectedProduct.price}</span>
                </div>

                <div className="aspect-square w-full bg-gray-900 mb-8 rounded-sm overflow-hidden border border-white/5 relative group">
                    {/* Fallback image if url is invalid, or just simple use */}
                    <img
                        src={selectedProduct.image}
                        alt={selectedProduct.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-in-out"
                    />

                    {/* Coordinates overlay aesthetic */}
                    <div className="absolute bottom-2 left-2 text-[10px] font-mono text-white/70">
                        LAT: {selectedProduct.lat.toFixed(4)} <br />
                        LNG: {selectedProduct.lng.toFixed(4)}
                    </div>
                </div>

                <p className="text-gray-300 leading-relaxed font-light mb-8">
                    {selectedProduct.description}
                </p>

                <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-blue-400 transition-colors">
                    Add to Cart
                </button>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10 text-[10px] font-mono text-white/30 flex justify-between">
                <span>ID: {selectedProduct.id}</span>
                <span>IN STOCK</span>
            </div>
        </motion.div>
    )
}
