import { motion } from 'framer-motion';

export function AboutSection() {
    return (
        <section className="relative z-10 w-full min-h-[50vh] bg-black/90 backdrop-blur-md border-t border-white/10 text-white py-20 px-6 pointer-events-auto">
            <div className="max-w-4xl mx-auto text-center space-y-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-4xl md:text-6xl font-light tracking-wide uppercase"
                >
                    About Orbital Market
                </motion.h2>
                <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full" />
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-xl text-gray-400 font-light leading-relaxed"
                >
                    We act as a bridge between rare earthly treasures and the digital frontier.
                    Our mission is to curate exclusive artifacts, precious stones, and unique items from the most remote corners of the globe,
                    making them accessible to collectors worldwide.
                </motion.p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
                    <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
                        <h3 className="text-xl font-medium mb-4 text-blue-400">Authentic Sourcing</h3>
                        <p className="text-sm text-gray-500">Every item is verified and directly sourced from local artisans and miners.</p>
                    </div>
                    <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
                        <h3 className="text-xl font-medium mb-4 text-purple-400">Global Logistics</h3>
                        <p className="text-sm text-gray-500">Secure shipping from remote locations directly to your doorstep.</p>
                    </div>
                    <div className="p-6 border border-white/5 rounded-2xl bg-white/5">
                        <h3 className="text-xl font-medium mb-4 text-green-400">Sustainable Trade</h3>
                        <p className="text-sm text-gray-500">We prioritize ethical practices and fair compensation for all partners.</p>
                    </div>
                </div>
                <footer className="pt-20 text-gray-600 text-sm">
                    © 2024 Orbital Market. All rights reserved.
                </footer>
            </div>
        </section>
    );
}
