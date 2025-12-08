import { motion } from 'framer-motion';
import type { Product, Location } from '../data/db';
import { useStore } from '../store';

export function ProductListSection() {
    const selectedLocation = useStore((state) => state.selectedLocation);
    const addToCart = useStore((state) => state.addToCart);

    if (!selectedLocation) return null;

    return (
        <section id="products" className="relative z-10 w-full min-h-screen bg-gradient-to-b from-transparent to-black text-white pt-20 px-6 pb-20 pointer-events-auto">
            <div className="max-w-6xl mx-auto">
                <div className="mb-16 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-light mb-4"
                    >
                        {selectedLocation.name}
                    </motion.h2>
                    <p className="text-xl text-blue-400 font-mono tracking-widest uppercase">{selectedLocation.country}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {selectedLocation.products.map((product) => (
                        <ProductCard key={product.id} product={product} addToCart={addToCart} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ product, addToCart }: { product: Product, addToCart: (p: Product) => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group bg-neutral-900/50 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300"
        >
            <div className="aspect-[4/3] overflow-hidden relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-medium group-hover:text-blue-400 transition-colors">{product.name}</h3>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-mono">${product.price.toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{product.description}</p>
                <button
                    onClick={() => addToCart(product)}
                    className="w-full py-3 bg-white/5 hover:bg-blue-600 text-white rounded-lg font-medium tracking-wide transition-all uppercase text-xs"
                >
                    Add to Cart
                </button>
            </div>
        </motion.div>
    )
}
