import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TranslationModalProps {
    isOpen: boolean;
    onClose: () => void;
    baseData: any; // The item being translated
    onSave: (translatedData: any) => void;
    type: 'LOCATION' | 'PRODUCT';
}

interface Language {
    id: number;
    name: string;
    available: boolean;
}

export function TranslationModal({ isOpen, onClose, baseData, onSave, type }: TranslationModalProps) {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [selectedLangId, setSelectedLangId] = useState<number | null>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            // Fetch languages if not already available in a global context (or passed in)
            fetch('http://localhost:3001/api/languages')
                .then(res => res.json())
                .then(data => {
                    // Filter out English (id 1) as it is the base
                    setLanguages(data.filter((l: any) => l.id !== 1));
                    if (data.length > 1 && !selectedLangId) {
                        setSelectedLangId(data.find((l: any) => l.id !== 1)?.id || null);
                    }
                });

            // Initialize form data with existing translations if baseData has them
            setFormData(baseData || {});
        }
    }, [isOpen, baseData]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleChange = (field: string, value: string) => {
        if (!selectedLangId) return;
        setFormData((prev: any) => ({
            ...prev,
            [`${field}_${selectedLangId}`]: value
        }));
    };

    const getValue = (field: string) => {
        if (!selectedLangId) return '';
        return formData[`${field}_${selectedLangId}`] || '';
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-neutral-900 border border-white/20 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-light text-white">Add Translation</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    {/* Language Selector */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Select Language</label>
                        <div className="flex flex-wrap gap-2">
                            {languages.map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => setSelectedLangId(lang.id)}
                                    className={`px-4 py-2 rounded-full text-sm transition-colors ${selectedLangId === lang.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedLangId && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            {type === 'LOCATION' && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Name ({languages.find(l => l.id === selectedLangId)?.name})</label>
                                        <input
                                            type="text"
                                            value={getValue('name')}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Translate Name..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Original: {baseData.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Country ({languages.find(l => l.id === selectedLangId)?.name})</label>
                                        <input
                                            type="text"
                                            value={getValue('country')}
                                            onChange={(e) => handleChange('country', e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Translate Country..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Original: {baseData.country}</p>
                                    </div>
                                </>
                            )}

                            {type === 'PRODUCT' && (
                                <>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Name ({languages.find(l => l.id === selectedLangId)?.name})</label>
                                        <input
                                            type="text"
                                            value={getValue('name')}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Translate Name..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Original: {baseData.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Description ({languages.find(l => l.id === selectedLangId)?.name})</label>
                                        <textarea
                                            value={getValue('description')}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none h-32"
                                            placeholder="Translate Description..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Original: {baseData.description}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Category ({languages.find(l => l.id === selectedLangId)?.name})</label>
                                        <input
                                            type="text"
                                            value={getValue('category')}
                                            onChange={(e) => handleChange('category', e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                            placeholder="Translate Category..."
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Original: {baseData.category}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-white/10 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                        Save Translations
                    </button>
                </div>
            </div>
        </div>
    );
}
