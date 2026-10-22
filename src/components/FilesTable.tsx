import type { FC, ReactNode } from 'react';
import type { SearchResult } from '../lib/DataEngine';

const highlightText = (text: string, query: string): ReactNode => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery || !text) return text;

  const escapedQuery = trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));

  return parts.map((part, index) =>
    part.toLowerCase() === trimmedQuery.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 text-slate-900 rounded px-1">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

const formatColumnName = (key: string): string | null => {
  const lowerKey = key.toLowerCase().trim();

  if (lowerKey.includes('№ з/п') || lowerKey === '№') return null;
  if (lowerKey.startsWith('__empty')) return null;
  if (lowerKey.includes('таблиця обліку')) return null;

  if (lowerKey.includes('прізвище')) return 'ПІБ';
  if (lowerKey.includes('найменування структурного')) return 'Підрозділ';
  if (
    lowerKey.includes('терміни навчання') ||
    lowerKey.includes('строки навчання') ||
    lowerKey === 'терміни'
  ) {
    return 'Період навчання';
  }
  if (lowerKey.includes('назва програми') || lowerKey.includes('назва кафедри')) {
    return 'Освітня програма / Кафедра';
  }
  if (lowerKey.includes('програмних результатів') || lowerKey.includes('кредит')) {
    return 'Обсяг (години/кредити)';
  }
  if (lowerKey.includes('назва теми') || lowerKey.includes('підсумкові роботи')) {
    return 'Тема роботи';
  }
  if (lowerKey.includes('реєстраційний номер')) return 'Номер документа';
  if (lowerKey.includes('яка підписала') || lowerKey.includes('посада, підпис')) {
    return 'Підписант';
  }

  return key;
};

interface NormalizedEntry {
  key: string;
  label: string;
  value: string;
}

interface FilesTableProps {
  results: SearchResult[];
  searchTerm: string;
}

export const FilesTable: FC<FilesTableProps> = ({ results, searchTerm }) => {
  const validResults = results
    .map((item) => {
      const { file, matchedName, matchedRowData } = item;
      const nameLower = (matchedName || '').toLowerCase();

      if (nameLower.includes('таблиця обліку')) return null;
      if (!matchedRowData || Object.keys(matchedRowData).length === 0) return null;

      const valuesStr = Object.values(matchedRowData).join(' ').toLowerCase();
      if (
        valuesStr.includes('таблиця обліку') &&
        (valuesStr.includes('сертифікат') ||
          valuesStr.includes('вчителям') ||
          valuesStr.includes('документ'))
      ) {
        return null;
      }
      if (valuesStr.includes('структурного підрозділу') && valuesStr.includes('терміни')) {
        return null;
      }

      const entries: NormalizedEntry[] = Object.entries(matchedRowData)
        .map(([key, value]) => {
          if (value === null || value === undefined || value === '') return null;
          const strVal = String(value).trim();
          if (!strVal) return null;

          const formattedLabel = formatColumnName(key);
          if (!formattedLabel) return null;

          return { key, label: formattedLabel, value: strVal };
        })
        .filter((entry): entry is NormalizedEntry => entry !== null);

      if (entries.length === 0) return null;

      return {
        file,
        matchedName: matchedName ? matchedName.trim() : '',
        entries,
      };
    })
    .filter(
      (
        item
      ): item is {
        file: SearchResult['file'];
        matchedName: string;
        entries: NormalizedEntry[];
      } => item !== null
    );

  if (validResults.length === 0) {
    return (
      <div className="text-center py-16 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-md transition-all duration-300">
        <p className="text-slate-500 text-lg">За вашим запитом нічого не знайдено.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white/95 backdrop-blur-xs rounded-lg border border-primary/15 shadow-md transition-all duration-300">
      <div className="px-4 sm:px-6 py-4 text-xs uppercase bg-primary/5 border-b border-primary/15 text-primary font-bold tracking-wider">
        Збіг у файлі
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-4">
        {validResults.map(({ file, matchedName, entries }) => (
          <div
            key={file.id}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/90 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col gap-4"
          >
            {matchedName && (
              <div className="w-full">
                <span className="inline-block max-w-full bg-accent/25 text-primary font-medium border border-accent/40 px-3 py-1.5 rounded-md text-xs break-words whitespace-normal transition-all duration-300">
                  {highlightText(matchedName, searchTerm)}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
              {entries.map(({ key, label, value }) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row items-start gap-1 sm:gap-2 p-2.5 rounded-md bg-white/80 hover:bg-white border border-slate-100 w-full break-words whitespace-normal transition-all duration-300"
                >
                  <span className="text-sm font-semibold text-primary break-words whitespace-normal w-full sm:w-auto">
                    {label}:
                  </span>
                  <span className="text-sm text-slate-700 break-words whitespace-normal w-full sm:flex-1">
                    {highlightText(value, searchTerm)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
