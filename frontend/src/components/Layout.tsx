import React from 'react';
import { Settings, History, BookOpen, Globe, Bug } from 'lucide-react';
import { useTranslation } from '../store/useAppStore';

interface LayoutProps {
  children: React.ReactNode;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenDebug: () => void;
  onGoHome: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  onOpenSettings, 
  onOpenHistory,
  onOpenDebug,
  onGoHome
}) => {
  const { t, language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={onGoHome}>
            <span className="text-sm font-semibold text-gray-700">质心教育科技</span>
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{t.appTitle}</h1>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
              {t.appSubtitle}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline-block">{language === 'en' ? '中文' : 'English'}</span>
            </button>
            
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            
            <button 
              onClick={onOpenDebug}
              title="Debug Logs"
              className="text-gray-400 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Bug className="w-5 h-5" />
            </button>

            <button 
              onClick={onOpenHistory}
              title="History"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <History className="w-5 h-5" />
            </button>
            
            <button 
              onClick={onOpenSettings}
              title="Settings"
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            {t.footer}
          </p>
          <p className="text-center text-sm text-gray-700 mt-2">联系作者： <a href="mailto:sunpeng@eduzhixin.com" className="underline">sunpeng@eduzhixin.com</a></p>
        </div>
      </footer>
    </div>
  );
};
