import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import type { Product } from '../data/db'

export function UIOverlay() {
    const selectedLocation = useStore((state) => state.selectedLocation)
    const viewMode = useStore((state) => state.viewMode)
    const activeView = useStore((state) => state.activeView)
    const activeUser = useStore((state) => state.user)
    const cart = useStore((state) => state.cart)

    const clearSelection = useStore((state) => state.clearSelection)
    const setActiveView = useStore((state) => state.setActiveView)

    return (
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col">
            <header className="p-6 flex justify-between items-center w-full bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
                <h1 className="text-2xl font-bold tracking-widest text-white cursor-pointer" onClick={() => clearSelection()}>ORBITAL MARKET</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveView('ACCOUNT')}
                        className={`text-sm font-medium transition-colors ${activeView === 'ACCOUNT' ? 'text-brand-accent' : 'text-white hover:text-brand-accent'}`}
                    >
                        ACCOUNT
                    </button>
                    <button
                        onClick={() => setActiveView('CART')}
                        className={`text-sm font-medium transition-colors ${activeView === 'CART' ? 'text-brand-accent' : 'text-white hover:text-brand-accent'}`}
                    >
                        CART ({cart.length})
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeView === 'ACCOUNT' ? (
                    <AccountView key="account" user={activeUser} onClose={() => setActiveView('MARKET')} />
                ) : activeView === 'CART' ? (
                    <CartView key="cart" cart={cart} onClose={() => setActiveView('MARKET')} />
                ) : (
                    // MARKET VIEW
                    <>
                        {viewMode === 'WORLD' || !selectedLocation ? (
                            <motion.div
                                key="world-ui"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col items-center justify-center text-center pointer-events-none"
                            >
                                <h2 className="text-4xl md:text-6xl font-light text-white mb-4 drop-shadow-lg">EXPLORE THE GLOBE</h2>
                                <p className="text-gray-300 max-w-md mx-auto">Click and drag to rotate. Select a marker to view available products in that region.</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="location-ui"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className="flex-1 flex flex-col w-full h-full overflow-hidden pointer-events-auto"
                            >
                                {/* Back Button / Header */}
                                <div className="p-6">
                                    <button
                                        onClick={clearSelection}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
                                    >
                                        ← BACK TO ORBIT
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 relative">
                                    <div className="max-w-4xl mx-auto mt-[40vh]"> {/* Push content down so we see the globe background initially */}
                                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-white shadow-2xl">
                                            <h2 className="text-5xl font-light mb-2">{selectedLocation.name}</h2>
                                            <div className="flex items-center gap-2 text-gray-400 mb-8">
                                                <span className="uppercase tracking-widest text-sm">{selectedLocation.country}</span>
                                                <span>•</span>
                                                <span className="font-mono text-xs text-brand-accent">{selectedLocation.lat.toFixed(2)}°N, {selectedLocation.lng.toFixed(2)}°E</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {selectedLocation.products.map(product => (
                                                    <ProductCard key={product.id} product={product} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Spacer at bottom */}
                                        <div className="h-32"></div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}

function AccountView({ user, onClose }: { user: any, onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex items-center justify-center p-6 pointer-events-auto"
        >
            <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕ CLOSE</button>
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center text-2xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-3xl font-light">{user.name}</h2>
                        <p className="text-gray-400">{user.email}</p>
                    </div>
                </div>

                <h3 className="text-xl font-medium mb-4 border-b border-white/10 pb-2">Order History</h3>
                <div className="space-y-4">
                    {user.orders.length === 0 ? (
                        <p className="text-gray-500 italic">No previous orders found.</p>
                    ) : (
                        user.orders.map((order: any) => <div key={order}>Order #{order}</div>)
                    )}
                </div>
            </div>
        </motion.div>
    )
}

function CartView({ cart, onClose }: { cart: Product[], onClose: () => void }) {
    const total = cart.reduce((sum, item) => sum + item.price, 0)
    const removeFromCart = useStore((state) => state.removeFromCart)

    return (
        <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="absolute inset-y-0 right-0 w-full md:w-96 bg-neutral-900/95 backdrop-blur-xl border-l border-white/10 z-20 shadow-2xl pointer-events-auto flex flex-col"
        >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-light">YOUR CART</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        Your cart is empty.
                        <br />
                        <button onClick={onClose} className="text-brand-accent mt-4 hover:underline">Start Exploring</button>
                    </div>
                ) : (
                    cart.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="flex gap-4">
                            <div className="w-20 h-20 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-sm">{item.name}</h3>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-500 text-xs">REMOVE</button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{item.category}</p>
                                <p className="text-sm font-mono mt-2">${item.price.toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20">
                <div className="flex justify-between items-center mb-4 text-lg font-medium">
                    <span>TOTAL</span>
                    <span className="font-mono text-brand-accent">${total.toLocaleString()}</span>
                </div>
                <button className="w-full py-3 bg-brand-accent hover:bg-blue-600 text-white rounded-lg font-bold tracking-wide transition-all">
                    CHECKOUT
                </button>
            </div>
        </motion.div>
    )
}


function ProductCard({ product }: { product: Product }) {
    const addToCart = useStore((state) => state.addToCart)

    return (
        <div className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-brand-accent/30 transition-all cursor-pointer relative overflow-hidden">
            <div className="aspect-video bg-gray-800 rounded-lg mb-4 overflow-hidden relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-lg text-white group-hover:text-brand-accent transition-colors">{product.name}</h3>
                    <p className="text-sm text-gray-400">{product.category}</p>
                </div>
                <span className="font-mono text-white bg-white/10 px-2 py-1 rounded text-sm">${product.price.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
            <button
                onClick={() => addToCart(product)}
                className="w-full mt-4 py-2 bg-brand-accent text-white rounded-lg font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
            >
                ADD TO CART
            </button>
        </div>
    )
}
