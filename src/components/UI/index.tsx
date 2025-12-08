import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store'
import { ProductCard } from './ProductCard'

export function UI() {
    const selectedProduct = useStore((state) => state.selectedProduct)

    return (
        <>
            <AnimatePresence>
                {!selectedProduct && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    >
                        <div className="absolute top-0 left-0 p-10">
                            <h1 className="text-white text-5xl font-bold font-sans tracking-tight mb-2">GLOBE</h1>
                            <h2 className="text-blue-400 text-xl font-mono tracking-widest uppercase">Marketplace</h2>
                        </div>

                        <div className="absolute bottom-10 left-10 text-white/50 text-sm font-mono max-w-sm">
                            <p className="mb-4">Use your mouse to rotate and zoom. Click on the markers to explore products from around the world.</p>
                            <div className="flex gap-4 text-xs tracking-widest opacity-50">
                                <span>DRAG TO ROTATE</span>
                                <span>SCROLL TO ZOOM</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedProduct && <ProductCard />}
            </AnimatePresence>
        </>
    )
}
