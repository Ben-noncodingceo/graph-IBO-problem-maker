import React from 'react';
import { useAppStore, useTranslation, AIModel } from '../store/useAppStore';
import { X, Key, Bot } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to get models array with translations
const getModels = (t: any): { id: AIModel; name: string; desc: string }[] => [
  { id: 'gemini', ...t.models.gemini },
  { id: 'openai', ...t.models.gpt4 }, // Note: id is 'openai' in store, but concept is GPT-4
  { id: 'deepseek', ...t.models.deepseek },
  { id: 'doubao', ...t.models.doubao },
  { id: 'tongyi', ...t.models.tongyi },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { selectedModel, setModel, apiKeys, setApiKey } = useAppStore();
  const { t } = useTranslation();
  const models = getModels(t);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-600" />
            {t.settingsTitle}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Model Selection */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              {t.selectModel}
            </h3>
            <div className="space-y-3">
              {models.map((model) => (
                <label 
                  key={model.id}
                  className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={() => setModel(model.id)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{model.desc}</div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 ${
                    selectedModel === model.id
                      ? 'border-blue-600'
                      : 'border-gray-300'
                  }`}>
                    {selectedModel === model.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* API Keys */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Key className="w-4 h-4" />
              {t.apiKeys}
            </h3>
            <div className="space-y-4">
              {models.map((model) => (
                <div key={model.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {model.name} API Key
                  </label>
                  <input
                    type="password"
                    value={apiKeys[model.id]}
                    onChange={(e) => setApiKey(model.id, e.target.value)}
                    placeholder={t.apiKeyPlaceholder}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-sm font-mono"
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              {t.apiKeyNote}
            </p>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors shadow-lg"
          >
            {t.saveClose}
          </button>
        </div>
      </div>
    </div>
  );
};
