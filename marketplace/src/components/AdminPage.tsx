import React, { useState, useEffect } from 'react';
import type { Location, Product } from '../data/db';

interface LocationWithProducts extends Location {
    products: Product[];
}

export function AdminPage() {
    const [locations, setLocations] = useState<LocationWithProducts[]>([]);
    const [loading, setLoading] = useState(true);

    // Location form
    const [locName, setLocName] = useState('');
    const [locCountry, setLocCountry] = useState('');
    const [locLat, setLocLat] = useState('');
    const [locLng, setLocLng] = useState('');

    // Product form
    const [prodName, setProdName] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodImage, setProdImage] = useState('https://placehold.co/400x300/333/fff?text=Product');
    const [prodCategory, setProdCategory] = useState('');
    const [prodLocationId, setProdLocationId] = useState('');

    const fetchLocations = async () => {
        try {
            const res = await fetch('/api/locations');
            const data = await res.json();
            setLocations(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleAddLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: locName,
                    country: locCountry,
                    lat: parseFloat(locLat),
                    lng: parseFloat(locLng)
                })
            });
            setLocName('');
            setLocCountry('');
            setLocLat('');
            setLocLng('');
            fetchLocations();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm('Удалить локацию?')) return;
        try {
            await fetch(`/api/locations/${id}`, { method: 'DELETE' });
            fetchLocations();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prodLocationId) {
            alert('Выберите локацию');
            return;
        }
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: prodName,
                    description: prodDesc,
                    price: parseFloat(prodPrice),
                    image: prodImage,
                    category: prodCategory,
                    locationId: prodLocationId
                })
            });
            setProdName('');
            setProdDesc('');
            setProdPrice('');
            setProdCategory('');
            fetchLocations();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Удалить товар?')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchLocations();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">🛠️ Admin Panel</h1>
                    <a href="/" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
                        ← Back to Globe
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Locations Section */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400">📍 Locations</h2>

                        <form onSubmit={handleAddLocation} className="mb-6 p-4 bg-gray-700 rounded-lg">
                            <h3 className="font-medium mb-3">Добавить локацию</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Название"
                                    value={locName}
                                    onChange={(e) => setLocName(e.target.value)}
                                    className="bg-gray-600 rounded px-3 py-2 text-sm"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Страна"
                                    value={locCountry}
                                    onChange={(e) => setLocCountry(e.target.value)}
                                    className="bg-gray-600 rounded px-3 py-2 text-sm"
                                    required
                                />
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Latitude"
                                    value={locLat}
                                    onChange={(e) => setLocLat(e.target.value)}
                                    className="bg-gray-600 rounded px-3 py-2 text-sm"
                                    required
                                />
                                <input
                                    type="number"
                                    step="any"
                                    placeholder="Longitude"
                                    value={locLng}
                                    onChange={(e) => setLocLng(e.target.value)}
                                    className="bg-gray-600 rounded px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="mt-3 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-medium transition"
                            >
                                + Добавить
                            </button>
                        </form>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {locations.map((loc) => (
                                <div key={loc.id} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                                    <div>
                                        <div className="font-medium">{loc.name}</div>
                                        <div className="text-sm text-gray-400">{loc.country} • {loc.lat.toFixed(2)}, {loc.lng.toFixed(2)}</div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteLocation(loc.id)}
                                        className="text-red-400 hover:text-red-300 px-3 py-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-gray-800 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 text-green-400">🛍️ Products</h2>

                        <form onSubmit={handleAddProduct} className="mb-6 p-4 bg-gray-700 rounded-lg">
                            <h3 className="font-medium mb-3">Добавить товар</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Название товара"
                                    value={prodName}
                                    onChange={(e) => setProdName(e.target.value)}
                                    className="w-full bg-gray-600 rounded px-3 py-2 text-sm"
                                    required
                                />
                                <textarea
                                    placeholder="Описание"
                                    value={prodDesc}
                                    onChange={(e) => setProdDesc(e.target.value)}
                                    className="w-full bg-gray-600 rounded px-3 py-2 text-sm h-20"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Цена"
                                        value={prodPrice}
                                        onChange={(e) => setProdPrice(e.target.value)}
                                        className="bg-gray-600 rounded px-3 py-2 text-sm"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Категория"
                                        value={prodCategory}
                                        onChange={(e) => setProdCategory(e.target.value)}
                                        className="bg-gray-600 rounded px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                                <input
                                    type="url"
                                    placeholder="URL изображения"
                                    value={prodImage}
                                    onChange={(e) => setProdImage(e.target.value)}
                                    className="w-full bg-gray-600 rounded px-3 py-2 text-sm"
                                />
                                <select
                                    value={prodLocationId}
                                    onChange={(e) => setProdLocationId(e.target.value)}
                                    className="w-full bg-gray-600 rounded px-3 py-2 text-sm"
                                    required
                                >
                                    <option value="">-- Выберите локацию --</option>
                                    {locations.map((loc) => (
                                        <option key={loc.id} value={loc.id}>{loc.name} ({loc.country})</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="mt-3 w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg font-medium transition"
                            >
                                + Добавить товар
                            </button>
                        </form>

                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {locations.flatMap((loc) =>
                                loc.products.map((prod) => (
                                    <div key={prod.id} className="flex justify-between items-center bg-gray-700 rounded-lg p-3">
                                        <div>
                                            <div className="font-medium">{prod.name}</div>
                                            <div className="text-sm text-gray-400">${prod.price} • {prod.category} • {loc.name}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteProduct(prod.id)}
                                            className="text-red-400 hover:text-red-300 px-3 py-1"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
