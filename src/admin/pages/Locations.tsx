import React, { useState, useEffect } from 'react';
import { Button, Input, Modal, Textarea } from '../components/ui';
import { TranslationModal } from '../components/TranslationModal';

interface Location {
    id: string;
    name: string;
    country: string;
    lat: number;
    lng: number;
    image?: string;
    description?: string;
}

export function Locations() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTranslationOpen, setIsTranslationOpen] = useState(false);
    const [selectedLocationForTranslation, setSelectedLocationForTranslation] = useState<Location | null>(null);

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        lat: '',
        lng: '',
        image: '',
        description: ''
    });

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/locations');
            const data = await res.json();
            setLocations(data);
        } catch (error) {
            console.error('Failed to fetch locations', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);
        if (formData.name) {
            uploadData.append('locationName', formData.name);
        }

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json();
            if (data.url) {
                setFormData(prev => ({ ...prev, image: data.url }));
            }
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (loc: Location) => {
        setIsEditing(true);
        setEditingId(loc.id);
        setFormData({
            name: loc.name,
            country: loc.country,
            lat: loc.lat.toString(),
            lng: loc.lng.toString(),
            image: loc.image || '',
            description: loc.description || ''
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ name: '', country: '', lat: '', lng: '', image: '', description: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = isEditing ? `/api/locations/${editingId}` : '/api/locations';
            const method = isEditing ? 'PUT' : 'POST';

            await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    country: formData.country,
                    lat: parseFloat(formData.lat),
                    lng: parseFloat(formData.lng),
                    image: formData.image,
                    description: formData.description
                })
            });
            setFormData({ name: '', country: '', lat: '', lng: '', image: '', description: '' });
            setIsModalOpen(false);
            fetchLocations();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Вы уверены, что хотите удалить эту локацию?')) return;
        try {
            await fetch(`/api/locations/${id}`, { method: 'DELETE' });
            fetchLocations();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Локации</h1>
                    <p className="text-gray-400 mt-1">Управление физическими точками на глобусе.</p>
                </div>
                <Button onClick={handleCreate}>
                    + Добавить локацию
                </Button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800/50 text-gray-400 text-sm uppercase tracking-wider">
                            <th className="p-4 font-medium">Название</th>
                            <th className="p-4 font-medium">Страна</th>
                            <th className="p-4 font-medium">Координаты</th>
                            <th className="p-4 font-medium text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Загрузка локаций...</td></tr>
                        ) : locations.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Локации не найдены.</td></tr>
                        ) : (
                            locations.map((loc) => (
                                <tr key={loc.id} className="hover:bg-gray-800/30 transition">
                                    <td className="p-4 text-white font-medium">
                                        <div className="flex items-center gap-3">
                                            {loc.image && <img src={loc.image} alt="" className="w-8 h-8 rounded object-cover bg-gray-700" />}
                                            {loc.name}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-400">{loc.country}</td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">
                                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => handleEdit(loc)}>
                                                ✏️
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => {
                                                setSelectedLocationForTranslation(loc);
                                                setIsTranslationOpen(true);
                                            }}>
                                                Перевод
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(loc.id)}>
                                                🗑️
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditing ? "Редактировать локацию" : "Добавить новую локацию"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Название локации"
                            placeholder="Например: Офис в Москве"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Страна"
                            placeholder="Например: Россия"
                            value={formData.country}
                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Широта (Latitude)"
                            type="number"
                            step="any"
                            placeholder="55.7558"
                            value={formData.lat}
                            onChange={e => setFormData({ ...formData, lat: e.target.value })}
                            required
                        />
                        <Input
                            label="Долгота (Longitude)"
                            type="number"
                            step="any"
                            placeholder="37.6173"
                            value={formData.lng}
                            onChange={e => setFormData({ ...formData, lng: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Изображение локации</label>
                        <div className="flex gap-4 items-start">
                            {formData.image && (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-700 group shrink-0">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, image: '' })}
                                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-800/50 transition bg-gray-900 group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {isUploading ? (
                                            <div className="flex items-center gap-2 text-blue-400">
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-sm">Загрузка...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-sm text-gray-400 group-hover:text-white transition-colors"><span className="font-semibold">Нажмите для загрузки</span></p>
                                                <p className="text-xs text-gray-500">JPG, PNG, WEBP</p>
                                            </>
                                        )}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                                <input
                                    type="text"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    className="mt-2 w-full bg-transparent border-none p-0 text-xs text-gray-600 focus:text-gray-400 focus:ring-0 placeholder-gray-700"
                                    placeholder="или вставьте URL напрямую..."
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Описание</label>
                        <textarea
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 h-24 resize-none"
                            placeholder="Краткое описание локации..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            {isEditing ? 'Сохранить изменения' : 'Создать локацию'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {selectedLocationForTranslation && (
                <TranslationModal
                    isOpen={isTranslationOpen}
                    onClose={() => {
                        setIsTranslationOpen(false);
                        setSelectedLocationForTranslation(null);
                    }}
                    baseData={selectedLocationForTranslation}
                    type="LOCATION"
                    onSave={async (translations) => {
                        try {
                            await fetch(`/api/locations/${selectedLocationForTranslation.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ...selectedLocationForTranslation,
                                    ...translations
                                })
                            });
                            fetchLocations();
                        } catch (error) {
                            console.error('Failed to save translations', error);
                        }
                    }}
                />
            )}
        </div>
    );
}
