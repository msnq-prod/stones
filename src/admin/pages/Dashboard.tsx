import React, { useEffect, useState } from 'react';

export function Dashboard() {
    const [stats, setStats] = useState({ locations: 0, products: 0, views: 1245 }); // Mock views for now

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/locations');
                const locations = await res.json();
                const productCount = locations.reduce((acc: number, loc: any) => acc + (loc.products?.length || 0), 0);
                setStats(prev => ({ ...prev, locations: locations.length, products: productCount }));
            } catch (error) {
                console.error('Failed to fetch stats', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white">Дашборд</h1>
                <p className="text-gray-400 mt-1">Обзор показателей вашего маркетплейса.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition duration-300">
                    <div className="text-gray-400 mb-1 font-medium">Всего локаций</div>
                    <div className="text-3xl font-bold text-white animated-value">{stats.locations}</div>
                    <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-2/3"></div>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-green-500/50 transition duration-300">
                    <div className="text-gray-400 mb-1 font-medium">Активных товаров</div>
                    <div className="text-3xl font-bold text-white">{stats.products}</div>
                    <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-1/2"></div>
                    </div>
                </div>

                <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition duration-300">
                    <div className="text-gray-400 mb-1 font-medium">Всего просмотров</div>
                    <div className="text-3xl font-bold text-white">{stats.views}</div>
                    <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-3/4"></div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center text-gray-500">
                    <p>Выберите "Локации" или "Товары" в боковом меню для управления контентом.</p>
                </div>
            </div>
        </div>
    );
}
