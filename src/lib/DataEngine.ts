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
                const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { range: 1 });
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
    const results: SearchResult[] = [];

    for (const file of this.files) {
      // Apply filters first to skip searching inside files that don't match
      if (selectedYear && file.year !== selectedYear) continue;
      if (selectedDate && file.date !== selectedDate) continue;

      if (!q) {
        // If no query, just return the file as a match (so default list works)
        results.push({ file, matchedName: '' });
        continue;
      }

      const data = this.fileCache.get(file.id);
      if (data) {
        let found = false;
        for (const row of data) {
          const values = Object.values(row);
          const rowStr = values.join(' ').toLowerCase();
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
