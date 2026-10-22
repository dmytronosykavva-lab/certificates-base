import * as XLSX from 'xlsx';
import type { FileEntry } from '../types';

export interface SearchResult {
  file: FileEntry;
  matchedName: string;
  matchedRowData?: Record<string, unknown>;
}

class DataEngine {
  private files: FileEntry[] = [];
  private fileCache: Map<string, Record<string, unknown>[]> = new Map();
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

                // Динамічний пошук справжнього рядка заголовків таблиці
                const rawRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
                let headerIndex = -1;
                for (let r = 0; r < Math.min(rawRows.length, 6); r++) {
                  const row = rawRows[r];
                  if (!Array.isArray(row)) continue;
                  const str = row.join(' ').toLowerCase();
                  if (
                    str.includes('прізвище') ||
                    str.includes('піб') ||
                    str.includes('слухач') ||
                    str.includes('учител') ||
                    str.includes('здобувач') ||
                    str.includes('№ з/п')
                  ) {
                    headerIndex = r;
                    break;
                  }
                }

                if (headerIndex === -1) {
                  let maxCols = 0;
                  for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
                    const row = rawRows[r];
                    if (Array.isArray(row) && row.filter(Boolean).length > maxCols) {
                      maxCols = row.filter(Boolean).length;
                      headerIndex = r;
                    }
                  }
                }
                if (headerIndex === -1) headerIndex = 1;

                const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: headerIndex });

                // Відфільтровуємо заголовні/довідкові рядки, які випадково потрапили в дані
                const json = rawJson.filter((row) => {
                  const values = Object.values(row);
                  if (values.length <= 1) return false;
                  const rowStr = values.join(' ').toLowerCase();
                  if (rowStr.includes('таблиця обліку') && (rowStr.includes('сертифікат') || rowStr.includes('документ') || rowStr.includes('свідоцтв'))) return false;
                  if (rowStr.includes('прізвище, ім') && rowStr.includes('структурного')) return false;
                  return true;
                });

                this.fileCache.set(file.id, json);
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
      // Apply filters first to skip searching inside files that don't match
      if (selectedYear && file.year !== selectedYear) continue;
      if (selectedDate && file.date !== selectedDate) continue;

      const data = this.fileCache.get(file.id);
      if (data) {
        let found = false;
        for (const row of data) {
          const values = Object.values(row);
          const rowStr = values.join(' ').toLowerCase();

          // Ігноруємо технічні/заголовні рядки
          if (rowStr.includes('таблиця обліку') && (rowStr.includes('сертифікат') || rowStr.includes('документ') || rowStr.includes('свідоцтв'))) continue;
          if (rowStr.includes('прізвище, ім') && rowStr.includes('структурного')) continue;

          if (rowStr.includes(q)) {
            // Find the exact cell that matched for better display
            const matchedCell = values.find(cell => String(cell).toLowerCase().includes(q)) || q;
            results.push({ file, matchedName: String(matchedCell), matchedRowData: row });
            found = true;
            break; // One match per file is enough for a file registry
          }
        }
        
        // Also fallback to search in file title if not found inside
        if (!found && file.title.toLowerCase().includes(q)) {
          results.push({ file, matchedName: 'Збіг у назві файлу' });
        }
      } else {
        // If file is not yet cached but matches title, return it anyway
        if (file.title.toLowerCase().includes(q)) {
          results.push({ file, matchedName: 'Збіг у назві файлу (вміст завантажується)' });
        }
      }
    }
    return results;
  }
}

export const dataEngine = new DataEngine();
