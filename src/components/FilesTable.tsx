import { Fragment } from 'react';
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
  const lowerKey = key.toLowerCase();
  
  if (lowerKey.includes('№ з/п') || lowerKey === '№') return null;
  if (lowerKey.startsWith('__empty')) return null;
  if (lowerKey.includes('таблиця обліку')) return null;

  if (lowerKey.includes('прізвище')) return 'ПІБ';
  if (lowerKey.includes('найменування структурного')) return 'Підрозділ';
  if (lowerKey.includes('терміни навчання')) return 'Період навчання';
  if (lowerKey.includes('назва програми') || lowerKey.includes('назва кафедри')) return 'Освітня програма / Кафедра';
  if (lowerKey.includes('програмних результатів') || lowerKey.includes('кредит')) return 'Обсяг (години/кредити)';
  if (lowerKey.includes('назва теми')) return 'Тема роботи';
  if (lowerKey.includes('реєстраційний номер')) return 'Номер документа';
  if (lowerKey.includes('яка підписала')) return 'Підписант';

  return key;
};

interface FilesTableProps {
  results: SearchResult[];
  searchTerm: string;
}

export const FilesTable: FC<FilesTableProps> = ({ results, searchTerm }) => {
  if (results.length === 0) {
    return (
      <div className="text-center py-16 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-md transition-all duration-300">
        <p className="text-slate-500 text-lg">За вашим запитом нічого не знайдено.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white/95 backdrop-blur-xs rounded-lg border border-primary/15 shadow-md transition-all duration-300">
      <table className="w-full text-sm text-left text-slate-700">
        <thead className="text-xs uppercase bg-primary/5 border-b border-primary/15 text-primary">
          <tr>
            <th scope="col" className="px-6 py-5 font-bold tracking-wider">
              Збіг у файлі
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {results
            .filter(({ matchedName, matchedRowData }) => {
              const nameLower = matchedName.toLowerCase();
              if (nameLower.includes('таблиця обліку')) return false;
              if (matchedRowData) {
                const valuesStr = Object.values(matchedRowData).join(' ').toLowerCase();
                if (
                  valuesStr.includes('таблиця обліку') &&
                  (valuesStr.includes('сертифікат') || valuesStr.includes('вчителям') || valuesStr.includes('документ'))
                ) {
                  return false;
                }
                if (valuesStr.includes('структурного підрозділу') && valuesStr.includes('терміни')) {
                  return false;
                }
              }
              return true;
            })
            .map(({ file, matchedName, matchedRowData }) => (
            <Fragment key={file.id}>
              <tr className="bg-white hover:bg-primary/[0.03] transition-all duration-300">
                <td className="px-6 py-4">
                  {matchedName ? (
                    <span className="inline-block bg-accent/25 text-primary font-medium border border-accent/40 px-3 py-1 rounded-md text-xs break-words transition-all duration-300">
                      {highlightText(matchedName, searchTerm)}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic">-</span>
                  )}
                </td>
              </tr>
              {matchedRowData && (
                <tr className="transition-all duration-300">
                  <td className="px-6 py-5 bg-slate-50/90 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(matchedRowData).map(([key, value]) => {
                        if (value === null || value === undefined || value === '') return null;
                        const strVal = String(value).trim();
                        if (!strVal) return null;

                        const formattedLabel = formatColumnName(key);
                        if (!formattedLabel) return null;
                        
                        return (
                          <div
                            key={key}
                            className="flex items-start gap-2 p-2 rounded-md hover:bg-white/80 transition-all duration-300"
                          >
                            <span className="text-sm font-semibold text-primary shrink-0">
                              {formattedLabel}:
                            </span>
                            <span className="text-sm text-slate-700 break-words">
                              {highlightText(strVal, searchTerm)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};
