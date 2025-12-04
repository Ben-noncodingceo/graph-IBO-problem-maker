import { useState } from 'react';
import { Layout } from './components/Layout';
import { SubjectSelector } from './components/SubjectSelector';
import { KeywordInput } from './components/KeywordInput';
import { SettingsPanel } from './components/SettingsPanel';
import { PaperList } from './components/PaperList';
import { QuestionCard } from './components/QuestionCard';
import { useAppStore, useTranslation } from './store/useAppStore';
import { api, Paper, Question } from './services/api';
import { Search, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [view, setView] = useState<'home' | 'results' | 'questions'>('home');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);

  const { selectedSubject, keywords, selectedModel, apiKeys } = useAppStore();
  const { t } = useTranslation();

  const handleSearch = async () => {
    if (!selectedSubject) return;
    
    setLoading(t.searching);
    try {
      const results = await api.searchPapers(selectedSubject, keywords);
      setPapers(results);
      setView('results');
    } catch (err) {
      alert('Search failed. Please ensure the Backend is running.');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerate = async (paper: Paper) => {
    if (!selectedSubject) return;
    
    // Get API Key if provided by user, otherwise use empty string (Backend will use Secret)
    const currentKey = apiKeys[selectedModel] || '';

    setSelectedPaper(paper);
    setLoading('Generating Questions... This may take 30s+');
    
    try {
      const generated = await api.generateQuestions(paper, selectedSubject, selectedModel, currentKey);
      setQuestions(generated);
      setView('questions');
    } catch (err) {
      alert('Generation failed. Check console for details.');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleReset = () => {
    setView('home');
    setPapers([]);
    setQuestions([]);
    setSelectedPaper(null);
  };

  return (
    <Layout onOpenSettings={() => setIsSettingsOpen(true)}>
      <div className="space-y-12">
        {/* Header Section (Show only on Home) */}
        {view === 'home' && (
          <div className="text-center space-y-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">
              {t.heroTitle} 
              <span className="text-blue-600">{t.heroTitleHighlight}</span>
              {t.heroTitleSuffix}
            </h2>
            <p className="text-lg text-gray-600">
              {t.heroDesc}
            </p>
          </div>
        )}

        {/* Home View */}
        {view === 'home' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <SubjectSelector />
            
            <KeywordInput />

            {selectedSubject && (
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleSearch}
                  disabled={!!loading}
                  className="flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {loading}
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      {t.searchButton}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {view === 'results' && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right duration-300">
            <button 
              onClick={() => setView('home')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </button>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                 <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                 <p className="text-gray-600 font-medium">{loading}</p>
              </div>
            ) : (
              <PaperList 
                papers={papers} 
                onSelect={handleGenerate} 
                isGenerating={!!loading}
              />
            )}
          </div>
        )}

        {/* Questions View */}
        {view === 'questions' && selectedPaper && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setView('results')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Papers
              </button>
              <button 
                onClick={handleReset}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Start New Session
              </button>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
              <h3 className="font-bold text-blue-900 mb-1">Generated from:</h3>
              <p className="text-blue-800">{selectedPaper.title}</p>
            </div>

            <div className="space-y-8">
              {questions.map((q, idx) => (
                <QuestionCard key={idx} question={q} index={idx} />
              ))}
            </div>
          </div>
        )}
      </div>

      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </Layout>
  );
}

export default App;
