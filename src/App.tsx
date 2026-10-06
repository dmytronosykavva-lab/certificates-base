import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { Filters } from './components/Filters';
import { FilesTable } from './components/FilesTable';
import { dataEngine } from './lib/DataEngine';
import type { FileEntry } from './types';

function App() {
  const [data, setData] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [cacheProgress, setCacheProgress] = useState(0);
  const [cacheTotal, setCacheTotal] = useState(0);

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

  const searchResults = useMemo(() => {
    // Re-run search if cache updates (trigger via cacheProgress) or inputs change
    if (cacheProgress < 0) return []; // Just to use the variable so eslint is happy
    return dataEngine.search(searchTerm, selectedYear, selectedDate);
  }, [searchTerm, selectedYear, selectedDate, cacheProgress]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {cacheTotal > 0 && cacheProgress < cacheTotal && (
          <div className="mb-8 flex justify-end">
            <div className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-[7px] border border-gray-200">
              Індексація файлів: {cacheProgress} / {cacheTotal}
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-primary text-lg font-medium">Завантаження індексу...</div>
        ) : error ? (
          <div className="py-20 text-center">
            <div className="inline-block bg-danger/10 border border-danger/20 rounded-[7px] p-8 max-w-lg w-full">
              <svg className="w-12 h-12 text-danger mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-danger text-lg font-bold font-heading">{error}</p>
              <p className="text-gray-600 mt-2 text-sm">Згенеруйте індекс файлів командою <code className="bg-white px-2 py-1 rounded-[4px] border border-gray-200">npm run update-db</code></p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-0 sm:p-2">
              <div className="mb-6">
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              </div>
              
              <Filters
                data={data}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            <FilesTable results={searchResults} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
