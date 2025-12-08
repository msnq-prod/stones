import { motion } from 'framer-motion'
import { useStore } from '../../store'

export function LocationDetails() {
    const selectedLocation = useStore((state) => state.selectedLocation)
    const setSelectedLocation = useStore((state) => state.setSelectedLocation)

    if (!selectedLocation) return null

    return (
        <div className="absolute top-0 right-0 w-full md:w-1/3 h-full bg-black/80 backdrop-blur-md border-l border-white/10 text-white overflow-y-auto pointer-events-auto">
            <div className="p-8 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <button
                        onClick={() => setSelectedLocation(null)}
                        className="mb-8 text-xs font-mono tracking-widest text-white/50 hover:text-white uppercase"
                    >
                        ← Back to Globe
                    </button>

                    <h2 className="text-4xl font-bold mb-2">{selectedLocation.title}</h2>
                    <p className="text-blue-400 font-mono mb-8 uppercase tracking-widest">{selectedLocation.country}</p>


                    <div className="space-y-12">
                        {selectedLocation.items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                                className="group"
                            >
                                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-900 mb-4 rounded-sm relative">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-medium">{item.title}</h3>
                                    <span className="font-mono text-blue-400">{item.price}</span>
                                </div>
                                <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                                <button className="mt-4 px-6 py-2 border border-white/20 hover:bg-white hover:text-black transition-colors text-xs font-mono tracking-widest uppercase">
                                    Add to Cart
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
