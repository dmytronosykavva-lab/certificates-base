import * as XLSX from 'xlsx';
import type { FileEntry } from '../types';

export interface SearchResult {
  file: FileEntry;
  matchedName: string;
  matchedRowData?: Record<string, unknown>;
}

interface CachedRow {
  raw: Record<string, unknown>;
  values: string[];
  searchStr: string;
}

class DataEngine {
  private files: FileEntry[] = [];
  private fileCache: Map<string, CachedRow[]> = new Map();
  public isLoading = false;
  public isLoaded = false;
  private progressCallback?: (progress: number, total: number) => void;

  setFiles(files: FileEntry[]) {
    this.files = files;
  }

  onProgress(cb: (progress: number, total: number) => void) {
    this.progressCallback = cb;
  }

  async loadAllFiles() {
    if (this.isLoading || this.isLoaded || this.files.length === 0) return;
    this.isLoading = true;
    let completed = 0;

    const chunkSize = 5;
    for (let i = 0; i < this.files.length; i += chunkSize) {
      const chunk = this.files.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (file) => {
          try {
            if (!this.fileCache.has(file.id)) {
              const res = await fetch(file.filePath);
              if (res.ok) {
                const buf = await res.arrayBuffer();
                const wb = XLSX.read(buf, { type: 'array' });
                const sheet = wb.Sheets[wb.SheetNames[0]];

                // Динамічний пошук справжнього рядка заголовків таблиці (має містити щонайменше 3 непорожні колонки)
                const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
                let headerIndex = -1;
                for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
                  const row = rawRows[r];
                  if (!Array.isArray(row)) continue;
                  const nonEmptyCells = row.filter(
                    (cell) => cell !== null && cell !== undefined && String(cell).trim() !== ''
                  );
                  if (nonEmptyCells.length < 3) continue;

                  const str = nonEmptyCells.join(' ').toLowerCase();
                  if (
                    str.includes('прізвище') ||
                    str.includes('піб') ||
                    str.includes('найменування структурного') ||
                    str.includes('назва програми') ||
                    str.includes('№ з/п')
                  ) {
                    headerIndex = r;
                    break;
                  }
                }

                if (headerIndex === -1) {
                  for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
                    const row = rawRows[r];
                    if (
                      Array.isArray(row) &&
                      row.filter((cell) => cell !== null && cell !== undefined && String(cell).trim() !== '').length >= 3
                    ) {
                      headerIndex = r;
                      break;
                    }
                  }
                }
                if (headerIndex === -1) headerIndex = 1;

                const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: headerIndex });

                // Попередньо індексуємо та фільтруємо рядки один раз під час завантаження
                const cachedRows: CachedRow[] = [];
                for (const row of rawJson) {
                  const values = Object.values(row)
                    .map((v) => (v !== null && v !== undefined ? String(v).trim() : ''))
                    .filter(Boolean);
                  if (values.length === 0) continue;

                  const searchStr = values.join(' ').toLowerCase();
                  if (
                    searchStr.includes('таблиця обліку') &&
                    (searchStr.includes('сертифікат') ||
                      searchStr.includes('документ') ||
                      searchStr.includes('свідоцтв'))
                  ) {
                    continue;
                  }
                  if (searchStr.includes('прізвище, ім') && searchStr.includes('структурного')) {
                    continue;
                  }

                  cachedRows.push({
                    raw: row,
                    values,
                    searchStr,
                  });
                }

                this.fileCache.set(file.id, cachedRows);
              }
            }
          } catch {
            console.error('Failed to parse', file.fileName);
          }
          completed++;
          if (this.progressCallback) {
            this.progressCallback(completed, this.files.length);
          }
        })
      );
    }

    this.isLoading = false;
    this.isLoaded = true;
  }

  search(query: string, selectedYear: string, selectedDate: string): SearchResult[] {
    const q = query.toLowerCase().trim();
    if (!q) {
      return [];
    }

    const results: SearchResult[] = [];

    for (const file of this.files) {
      if (selectedYear && file.year !== selectedYear) continue;
      if (selectedDate && file.date !== selectedDate) continue;

      const data = this.fileCache.get(file.id);
      if (data) {
        for (const cachedRow of data) {
          if (cachedRow.searchStr.includes(q)) {
            const matchedCell =
              cachedRow.values.find((cell) => cell.toLowerCase().includes(q)) || q;
            results.push({
              file,
              matchedName: matchedCell,
              matchedRowData: cachedRow.raw,
            });
          }
        }
      }
    }
    return results;
  }
}

export const dataEngine = new DataEngine();
