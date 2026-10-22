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
      <div className="text-center py-16 bg-white border border-gray-200 rounded-[7px]">
        <p className="text-gray-500 text-lg">За вашим запитом нічого не знайдено.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-[7px] border border-gray-200">
      <table className="w-full text-sm text-left text-gray-700">
        <thead className="text-xs uppercase bg-gray-50 border-b border-gray-200 text-primary">
          <tr>
            <th scope="col" className="px-6 py-5 font-bold tracking-wider">Збіг у файлі</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {results.map(({ file, matchedName, matchedRowData }) => (
            <Fragment key={file.id}>
              <tr className="bg-white hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  {matchedName ? (
                    <span className="inline-block bg-accent/20 text-yellow-800 px-2.5 py-1 rounded text-xs break-words">
                      {highlightText(matchedName, searchTerm)}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-xs italic">-</span>
                  )}
                </td>
              </tr>
              {matchedRowData && (
                <tr>
                  <td className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(matchedRowData).map(([key, value]) => {
                        if (value === null || value === undefined || value === '') return null;
                        const strVal = String(value).trim();
                        if (!strVal) return null;

                        const formattedLabel = formatColumnName(key);
                        if (!formattedLabel) return null;
                        
                        return (
                          <div key={key} className="flex items-start gap-2">
                            <span className="text-sm font-semibold text-primary shrink-0">{formattedLabel}:</span>
                            <span className="text-sm text-gray-700 break-words">
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

