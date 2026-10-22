import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchInput } from './components/SearchInput';
import { Filters } from './components/Filters';
import { FilesTable } from './components/FilesTable';
import { AnimatedBackground } from './components/AnimatedBackground';
import { dataEngine } from './lib/DataEngine';
import type { SearchResult } from './lib/DataEngine';
import type { FileEntry } from './types';

const EMPTY_RESULTS: SearchResult[] = [];

/** Як часто (у кількості проіндексованих файлів) оновлювати результати під час фонової індексації. */
const INDEX_REFRESH_STEP = 10;

function App() {
  const [data, setData] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Фінальний (debounced) запит. Оновлюється лише з SearchInput після паузи у введенні,
  // тому App НЕ перемальовується на кожне натискання клавіші.
  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [cacheProgress, setCacheProgress] = useState(0);
  const [cacheTotal, setCacheTotal] = useState(0);
  // Лічильник "версії" індексу: збільшується не на кожен файл, а кожні INDEX_REFRESH_STEP файлів
  // та по завершенню. Саме він (а не cacheProgress) тригерить повторний пошук.
  const [indexVersion, setIndexVersion] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/files-index.json');
        if (!response.ok) {
          throw new Error('База даних не знайдена. Спочатку запустіть скрипт генерації.');
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('База даних не знайдена. Спочатку запустіть скрипт генерації.');
        }

        const rawData = await response.json();
        const files = rawData as FileEntry[];
        setData(files);
        
        // Start background caching
        dataEngine.setFiles(files);
        dataEngine.onProgress((progress, total) => {
          setCacheProgress(progress);
          setCacheTotal(total);
          if (progress === total || progress % INDEX_REFRESH_STEP === 0) {
            setIndexVersion((version) => version + 1);
          }
        });
        
        dataEngine.loadAllFiles().catch(console.error);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка при читанні бази даних.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Стабільні посилання на обробники — інакше React.memo у дочірніх компонентах ігнорується.
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleYearChange = useCallback((value: string) => {
    setSelectedYear(value);
  }, []);

  const handleDateChange = useCallback((value: string) => {
    setSelectedDate(value);
  }, []);

  const searchResults = useMemo(() => {
    // indexVersion використовується як тригер повторного пошуку після догрузки нових файлів
    if (indexVersion < 0 || !query) return EMPTY_RESULTS;
    return dataEngine.search(query, selectedYear, selectedDate);
  }, [query, selectedYear, selectedDate, indexVersion]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40 overflow-hidden">
      <AnimatedBackground />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {cacheTotal > 0 && cacheProgress < cacheTotal && (
          <div className="mb-6 flex justify-end">
            <div className="text-sm font-medium text-primary bg-white/90 backdrop-blur-xs px-4 py-2 rounded-lg border border-primary/15 shadow-xs transition-all duration-300">
              Індексація файлів: {cacheProgress} / {cacheTotal}
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-primary text-lg font-medium animate-pulse">
            Завантаження індексу...
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <div className="inline-block bg-danger/10 border border-danger/20 rounded-lg p-8 max-w-lg w-full shadow-md transition-all duration-300">
              <svg className="w-12 h-12 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-danger text-lg font-bold font-heading">{error}</p>
              <p className="text-slate-600 mt-2 text-sm">
                Згенеруйте індекс файлів командою{' '}
                <code className="bg-white px-2 py-1 rounded border border-slate-200">npm run update-db</code>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-primary/10 shadow-md transition-all duration-300 hover:shadow-lg">
              <div className="mb-6">
                <SearchInput onSearch={handleSearch} />
              </div>
              
              <Filters
                data={data}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>

            {query !== '' && (
              <FilesTable
                key={`${query}|${selectedYear}|${selectedDate}`}
                results={searchResults}
                searchTerm={query}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
