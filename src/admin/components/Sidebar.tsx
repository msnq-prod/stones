import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const menuItems = [
    { label: 'Дашборд', path: '/admin', icon: '📊' },
    { label: 'Локации', path: '/admin/locations', icon: '📍' },
    { label: 'Товары', path: '/admin/products', icon: '🛍️' },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col border-r border-gray-800">
            <div className="p-6 border-b border-gray-800">
                <Link to="/" className="text-2xl font-bold flex items-center gap-2 hover:text-blue-400 transition">
                    🌍 <span className="text-lg">GlobeMarket</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition px-4 py-2"
                >
                    <span>← Вернуться на сайт</span>
                </Link>
            </div>
        </aside>
    );
}
