import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import type { Product, Location } from '../data/db';
import { useStore } from '../store';
import { getLocalizedValue } from '../utils/language';
import { X } from 'lucide-react';

export function ProductListSection() {
    const { selectedLocation, cart, addToCart, removeFromCart, language } = useStore();

    if (!selectedLocation) return null;

    return (
        <section id="products" className="relative z-10 w-full min-h-screen bg-black/30 backdrop-blur-md border-t border-white/10 text-white mt-[80vh] pt-20 px-6 pb-20 pointer-events-auto">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {selectedLocation.products.map((product) => (
                        <ProductCard key={product.id} product={product} addToCart={addToCart} language={language} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ product, addToCart, language }: { product: Product, addToCart: (p: Product) => void, language: string }) {
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
                <h3 className="font-bold text-lg mb-1">{getLocalizedValue(product, 'name', language)}</h3>
                <p className="text-sm text-white/60 mb-3">{getLocalizedValue(product, 'description', language)}</p>
                <div className="flex justify-between items-center">
                    <span className="text-blue-400 font-medium">${product.price}</span>
                    <span className="text-xs px-2 py-1 bg-white/10 rounded">{getLocalizedValue(product, 'category', language)}</span>
                </div>
                <button
                    onClick={() => addToCart(product)}
                    className="w-full py-3 bg-white/5 hover:bg-blue-600 text-white rounded-lg font-medium tracking-wide transition-all uppercase text-xs mt-6"
                >
                    Add to Cart
                </button>
            </div>
        </motion.div>
    )
}
