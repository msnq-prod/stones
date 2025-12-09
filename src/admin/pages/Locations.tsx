import React, { useState, useEffect } from 'react';
import { Button, Input, Modal } from '../components/ui';
import { TranslationModal } from '../components/TranslationModal';

interface Location {
    id: string;
    name: string;
    country: string;
    lat: number;
    lng: number;
}

export function Locations() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTranslationOpen, setIsTranslationOpen] = useState(false);
    const [selectedLocationForTranslation, setSelectedLocationForTranslation] = useState<Location | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        lat: '',
        lng: ''
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    country: formData.country,
                    lat: parseFloat(formData.lat),
                    lng: parseFloat(formData.lng)
                })
            });
            setFormData({ name: '', country: '', lat: '', lng: '' });
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
                <Button onClick={() => setIsModalOpen(true)}>
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
                                    <td className="p-4 text-white font-medium">{loc.name}</td>
                                    <td className="p-4 text-gray-400">{loc.country}</td>
                                    <td className="p-4 text-gray-500 font-mono text-xs">
                                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="secondary" size="sm" onClick={() => {
                                                setSelectedLocationForTranslation(loc);
                                                setIsTranslationOpen(true);
                                            }}>
                                                Перевод
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(loc.id)}>
                                                Удалить
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Добавить новую локацию">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-800">
                        <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
                            Отмена
                        </Button>
                        <Button type="submit" variant="primary" className="flex-1">
                            Создать локацию
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
            )
            }
        </div >
    );
}
