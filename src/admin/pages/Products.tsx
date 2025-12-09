import React, { useState, useEffect } from 'react';
import { Button, Input, Modal } from '../components/ui';
import { TranslationModal } from '../components/TranslationModal';

interface Location {
    id: string;
    name: string;
    country: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    level: number;
    locationId: string;
    locationName?: string;
}

export function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isTranslationOpen, setIsTranslationOpen] = useState(false);
    const [selectedProductForTranslation, setSelectedProductForTranslation] = useState<Product | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        level: '1',
        locationId: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [locRes, prodRes] = await Promise.all([
                fetch('/api/locations'),
                fetch('/api/products')
            ]);

            const locData = await locRes.json();
            setLocations(locData);

            const prodData = await prodRes.json();
            // Map backend product with location to frontend structure
            const allProducts = prodData.map((prod: any) => ({
                ...prod,
                locationName: prod.location?.name || 'Unknown'
            }));
            setProducts(allProducts);

        } catch (error) {
            console.error('Не удалось загрузить данные', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const uploadData = new FormData();
        uploadData.append('image', file);

        setIsUploading(true);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json();
            if (data.url) {
                // Ensure full URL if needed, but relative should work if proxy is set up or same origin
                // If the backend runs on 3001 and frontend on 5173, we might need full URL for image src
                // For now assuming relative path works if served correctly or proxy handling
                // But let's prepend backend URL just in case for now if we are not proxying uploads
                setFormData(prev => ({ ...prev, image: data.url }));
            }
        } catch (error) {
            console.error('Ошибка загрузки изображения', error);
            alert('Не удалось загрузить изображение');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProductId(product.id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            image: product.image,
            category: product.category,
            level: (product.level || 1).toString(),
            locationId: product.locationId
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProductId(null);
        setFormData({ name: '', description: '', price: '', image: '', category: '', level: '1', locationId: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.locationId) {
            alert('Пожалуйста, выберите локацию');
            return;
        }

        try {
            const url = editingProductId
                ? `/api/products/${editingProductId}`
                : '/api/products';
            const method = editingProductId ? 'PUT' : 'POST';

            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    image: formData.image || 'https://placehold.co/400x300/333/fff?text=No+Image',
                    category: formData.category,
                    level: parseInt(formData.level),
                    locationId: formData.locationId
                })
            });

            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
        try {
            await fetch(`/api/products/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    // Group products by location
    const productsByLocation = locations.reduce((acc, loc) => {
        const locationProducts = products.filter(p => p.locationId === loc.id);
        if (locationProducts.length > 0) {
            acc[loc.name] = locationProducts;
        }
        return acc;
    }, {} as Record<string, Product[]>);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Товары</h1>
                    <p className="text-gray-400 mt-1">Управление ассортиментом маркетплейса.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Добавить товар
                </Button>
            </div>

            <div className="space-y-8">
                {isLoading ? (
                    <div className="text-center text-gray-500 py-12">Загрузка товаров...</div>
                ) : Object.keys(productsByLocation).length === 0 ? (
                    <div className="text-center text-gray-500 py-12">Товары не найдены.</div>
                ) : (
                    Object.entries(productsByLocation).map(([locationName, locationProducts]) => (
                        <div key={locationName} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                            <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-800 flex items-center gap-2">
                                <span className="text-xl">📍</span>
                                <h3 className="font-semibold text-blue-400">{locationName}</h3>
                                <span className="text-sm text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full ml-2">
                                    {locationProducts.length}
                                </span>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-800/30 text-gray-400 text-sm uppercase tracking-wider">
                                        <th className="p-4 font-medium">Товар</th>
                                        <th className="p-4 font-medium">Категория</th>
                                        <th className="p-4 font-medium">Уровень</th>
                                        <th className="p-4 font-medium">Цена</th>
                                        <th className="p-4 font-medium text-right">Действия</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {locationProducts.map((prod) => (
                                        <tr key={prod.id} className="hover:bg-gray-800/30 transition">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={prod.image} alt="" className="w-10 h-10 rounded bg-gray-700 object-cover" />
                                                    <div className="font-medium text-white">{prod.name}</div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-400">{prod.category}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${prod.level === 3 ? 'bg-yellow-500/20 text-yellow-500' :
                                                    prod.level === 2 ? 'bg-blue-500/20 text-blue-500' :
                                                        'bg-gray-500/20 text-gray-500'
                                                    }`}>
                                                    LVL {prod.level || 1}
                                                </span>
                                            </td>
                                            <td className="p-4 text-green-400 font-mono">${prod.price}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="secondary" size="sm" onClick={() => {
                                                        setSelectedProductForTranslation(prod);
                                                        setIsTranslationOpen(true);
                                                    }}>
                                                        Перевод
                                                    </Button>
                                                    <Button variant="secondary" size="sm" onClick={() => handleEdit(prod)}>
                                                        Изменить
                                                    </Button>
                                                    <Button variant="danger" size="sm" onClick={() => handleDelete(prod.id)}>
                                                        ✕
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingProductId ? "Редактировать товар" : "Добавить новый товар"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Название товара"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Описание</label>
                        <textarea
                            className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 outline-none transition-colors h-24"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Цена"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <Input
                            label="Категория"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Уровень (Level)</label>
                        <select
                            className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
                            value={formData.level}
                            onChange={e => setFormData({ ...formData, level: e.target.value })}
                        >
                            <option value="1">Level 1 (Common)</option>
                            <option value="2">Level 2 (Rare)</option>
                            <option value="3">Level 3 (Legendary)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Изображение</label>
                        <div className="flex gap-4 items-start">
                            {formData.image && (
                                <img src={formData.image} alt="Preview" className="w-20 h-20 rounded object-cover bg-gray-800" />
                            )}
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="block w-full text-sm text-gray-400
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-600 file:text-white
                                        hover:file:bg-blue-500
                                        cursor-pointer"
                                />
                                {isUploading && <p className="text-xs text-yellow-500 mt-1">Загрузка...</p>}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Локация</label>
                        <select
                            className="w-full bg-gray-900 border border-gray-700 focus:border-blue-500 rounded-lg px-4 py-2.5 text-white outline-none transition-colors"
                            value={formData.locationId}
                            onChange={e => setFormData({ ...formData, locationId: e.target.value })}
                            required
                        >
                            <option value="">-- Выберите локацию --</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name} ({loc.country})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
                        <Button type="button" variant="secondary" className="flex-1" onClick={handleCloseModal}>
                            Отмена
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1" disabled={isUploading}>
                            {editingProductId ? "Сохранить изменения" : "Добавить товар"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {
                selectedProductForTranslation && (
                    <TranslationModal
                        isOpen={isTranslationOpen}
                        onClose={() => {
                            setIsTranslationOpen(false);
                            setSelectedProductForTranslation(null);
                        }}
                        baseData={selectedProductForTranslation}
                        type="PRODUCT"
                        onSave={async (translations) => {
                            try {
                                await fetch(`/api/products/${selectedProductForTranslation.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        ...selectedProductForTranslation,
                                        ...translations
                                    })
                                });
                                fetchData();
                            } catch (error) {
                                console.error('Failed to save translations', error);
                            }
                        }}
                    />
                )
            }
        </div >
    );
}
