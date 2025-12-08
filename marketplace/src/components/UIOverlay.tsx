import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'
import type { Product } from '../data/db'

export function UIOverlay() {
    const activeView = useStore((state) => state.activeView)
    const activeUser = useStore((state) => state.user)
    const cart = useStore((state) => state.cart)
    const setActiveView = useStore((state) => state.setActiveView)
    const clearSelection = useStore((state) => state.clearSelection)

    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex flex-col">
            <header className="p-6 flex justify-between items-center w-full bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
                <h1 className="text-2xl font-light tracking-widest text-white cursor-pointer" onClick={() => clearSelection()}>ORBITAL MARKET</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveView('ACCOUNT')}
                        className={`text-sm font-medium transition-colors ${activeView === 'ACCOUNT' ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
                    >
                        ACCOUNT
                    </button>
                    <button
                        onClick={() => setActiveView('CART')}
                        className={`text-sm font-medium transition-colors ${activeView === 'CART' ? 'text-blue-400' : 'text-white hover:text-blue-400'}`}
                    >
                        CART ({cart.length})
                    </button>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeView === 'ACCOUNT' && (
                    <AccountView key="account" user={activeUser} onClose={() => setActiveView('MARKET')} />
                )}
                {activeView === 'CART' && (
                    <CartView key="cart" cart={cart} onClose={() => setActiveView('MARKET')} />
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
            className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 pointer-events-auto"
        >
            <div className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-2xl p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕ CLOSE</button>
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
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
            className="absolute inset-y-0 right-0 w-full md:w-96 bg-neutral-900/95 backdrop-blur-xl border-l border-white/10 z-50 shadow-2xl pointer-events-auto flex flex-col"
        >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-light">YOUR CART</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10">
                        Your cart is empty.
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
                    <span className="font-mono text-blue-400">${total.toLocaleString()}</span>
                </div>
                <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold tracking-wide transition-all">
                    CHECKOUT
                </button>
            </div>
        </motion.div>
    )
}
