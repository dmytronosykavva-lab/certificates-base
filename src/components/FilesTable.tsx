import { memo, useMemo } from 'react';
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

interface ExtraField {
  key: string;
  label: string;
  value: string;
}

interface ParsedCertificate {
  id: string;
  matchedName: string;
  fullName: string;
  department: string;
  period: string;
  program: string;
  volume: string;
  topic: string;
  documentNumber: string;
  signatory: string;
  extraFields: ExtraField[];
  hasDetails: boolean;
}

const cleanValue = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (!str || str === '-' || str === '—') return '';
  return str;
};

const parseCertificateRow = (item: SearchResult, index: number): ParsedCertificate | null => {
  const { file, matchedName, matchedRowData } = item;
  const cleanedMatchedName = cleanValue(matchedName);

  if (
    cleanedMatchedName.toLowerCase().includes('таблиця обліку') ||
    cleanedMatchedName.toLowerCase().includes('збіг у назві файлу')
  ) {
    return null;
  }

  let fullName = '';
  let department = '';
  let period = '';
  let program = '';
  let volume = '';
  let topic = '';
  let documentNumber = '';
  let signatory = '';
  const extraFields: ExtraField[] = [];

  if (matchedRowData && typeof matchedRowData === 'object') {
    const allValuesStr = Object.values(matchedRowData)
      .map(cleanValue)
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    if (
      (allValuesStr.includes('таблиця обліку') &&
        (allValuesStr.includes('сертифікат') ||
          allValuesStr.includes('вчителям') ||
          allValuesStr.includes('документ') ||
          allValuesStr.includes('свідоцтв'))) ||
      (allValuesStr.includes('структурного підрозділу') && allValuesStr.includes('терміни'))
    ) {
      return null;
    }

    for (const [rawKey, rawVal] of Object.entries(matchedRowData)) {
      const val = cleanValue(rawVal);
      if (!val) continue;

      const lowerKey = rawKey.toLowerCase().trim();

      if (
        lowerKey === '№' ||
        lowerKey.includes('№ з/п') ||
        lowerKey.startsWith('__empty') ||
        lowerKey.includes('таблиця обліку')
      ) {
        continue;
      }

      if (
        lowerKey.includes('яка підписала') ||
        lowerKey.includes('посада') ||
        lowerKey.includes('підпис') ||
        lowerKey.includes('проректор')
      ) {
        if (!signatory) signatory = val;
      } else if (
        lowerKey.includes('прізвище') ||
        lowerKey.includes('піб') ||
        lowerKey.includes('слухач') ||
        lowerKey.includes('здобувач')
      ) {
        if (!fullName) fullName = val;
      } else if (
        lowerKey.includes('найменування структурного') ||
        lowerKey.includes('структурного підрозділу') ||
        lowerKey.includes('підрозділ')
      ) {
        if (!department) department = val;
      } else if (
        lowerKey.includes('терміни') ||
        lowerKey.includes('строки навчання') ||
        lowerKey.includes('період')
      ) {
        if (!period) period = val;
      } else if (
        lowerKey.includes('назва програми') ||
        lowerKey.includes('назва кафедри') ||
        lowerKey.includes('програма')
      ) {
        if (!program) program = val;
      } else if (
        lowerKey.includes('програмних результатів') ||
        lowerKey.includes('кредит') ||
        lowerKey.includes('обсяг') ||
        lowerKey.includes('годин')
      ) {
        if (!volume) volume = val;
      } else if (
        lowerKey.includes('назва теми') ||
        lowerKey.includes('підсумкові роботи') ||
        lowerKey.includes('випускної роботи') ||
        lowerKey.includes('тема')
      ) {
        if (!topic) topic = val;
      } else if (
        lowerKey.includes('реєстраційний номер') ||
        lowerKey.includes('серія') ||
        lowerKey.includes('номер документа') ||
        lowerKey.includes('номер сертифіката')
      ) {
        if (!documentNumber) documentNumber = val;
      } else {
        extraFields.push({ key: rawKey, label: rawKey.trim(), value: val });
      }
    }
  }

  const hasDetails = Boolean(
    department ||
      period ||
      program ||
      volume ||
      topic ||
      documentNumber ||
      signatory ||
      extraFields.length > 0
  );

  if (!fullName && !cleanedMatchedName && !documentNumber && !hasDetails) {
    return null;
  }

  return {
    id: `${file.id}-${index}`,
    matchedName: cleanedMatchedName || fullName,
    fullName,
    department,
    period,
    program,
    volume,
    topic,
    documentNumber,
    signatory,
    extraFields,
    hasDetails,
  };
};

const fieldBoxClass =
  'flex flex-col sm:flex-row items-start gap-1 sm:gap-2 p-2.5 rounded-md bg-white/90 hover:bg-white border border-slate-100 w-full h-auto break-words whitespace-normal transition-all duration-300';
const labelClass =
  'text-sm font-semibold text-primary break-words whitespace-normal w-full sm:w-auto';
const valueClass =
  'text-sm text-slate-700 break-words whitespace-normal w-full sm:flex-1';

interface CertificateCardProps {
  item: ParsedCertificate;
  searchTerm: string;
}

const CertificateCard: FC<CertificateCardProps> = memo(({ item, searchTerm }) => {
  // Fallback UI: суперкомпактна картка, якщо крім ПІБ немає жодних інших даних
  if (!item.hasDetails) {
    const displayTitle = item.fullName || item.matchedName;
    if (!displayTitle) return null;

    return (
      <div className="w-full h-auto rounded-lg border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all duration-300 flex items-center">
        <span className="inline-block max-w-full bg-accent/25 text-primary font-medium border border-accent/40 px-3 py-1 rounded-md text-xs sm:text-sm break-words whitespace-normal">
          {highlightText(displayTitle, searchTerm)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-auto rounded-lg border border-slate-200 bg-slate-50/90 p-4 sm:p-5 shadow-2xs hover:shadow-md hover:border-primary/30 transition-all duration-300 flex flex-col gap-3">
      {item.matchedName && (
        <div className="w-full h-auto">
          <span className="inline-block max-w-full bg-accent/25 text-primary font-medium border border-accent/40 px-3 py-1 rounded-md text-xs break-words whitespace-normal transition-all duration-300">
            {highlightText(item.matchedName, searchTerm)}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full h-auto items-start">
        {item.fullName && (
          <div className={fieldBoxClass}>
            <span className={labelClass}>ПІБ:</span>
            <span className={valueClass}>{highlightText(item.fullName, searchTerm)}</span>
          </div>
        )}

        {item.department && (
          <div className={fieldBoxClass}>
            <span className={labelClass}>Підрозділ:</span>
            <span className={valueClass}>{highlightText(item.department, searchTerm)}</span>
          </div>
        )}

        {item.period && (
          <div className={fieldBoxClass}>
            <span className={labelClass}>Період навчання:</span>
            <span className={valueClass}>{highlightText(item.period, searchTerm)}</span>
          </div>
        )}

        {item.program && (
          <div className={fieldBoxClass}>
            <span className={labelClass}>Освітня програма / Кафедра:</span>
            <span className={valueClass}>{highlightText(item.program, searchTerm)}</span>
          </div>
        )}

        {item.volume && (
          <div className={fieldBoxClass}>
            <span className={labelClass}>Обсяг (години/кредити):</span>
            <span className={valueClass}>{highlightText(item.volume, searchTerm)}</span>
          </div>
        )}

        {item.topic && (
          <div className={fieldBoxClass}>
            <span className={labelClass}>Тема роботи:</span>
            <span className={valueClass}>{highlightText(item.topic, searchTerm)}</span>
          </div>
        )}

        {item.documentNumber && (
          <div className={fieldBoxClass}>
            <span className={labelClass}>Номер документа:</span>
            <span className={valueClass}>{highlightText(item.documentNumber, searchTerm)}</span>
          </div>
        )}

        {item.signatory && (
          <div className={fieldBoxClass}>
            <span className={labelClass}>Підписант:</span>
            <span className={valueClass}>{highlightText(item.signatory, searchTerm)}</span>
          </div>
        )}

        {item.extraFields.map((field) => (
          <div key={field.key} className={fieldBoxClass}>
            <span className={labelClass}>{field.label}:</span>
            <span className={valueClass}>{highlightText(field.value, searchTerm)}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

CertificateCard.displayName = 'CertificateCard';

interface FilesTableProps {
  results: SearchResult[];
  searchTerm: string;
}

export const FilesTable: FC<FilesTableProps> = memo(({ results, searchTerm }) => {
  const validItems = useMemo(() => {
    return results
      .map((item, idx) => parseCertificateRow(item, idx))
      .filter((item): item is ParsedCertificate => item !== null);
  }, [results]);

  if (validItems.length === 0) {
    return (
      <div className="text-center py-12 px-4 bg-white/95 backdrop-blur-xs border border-slate-200 rounded-lg shadow-md transition-all duration-300">
        <p className="text-slate-500 text-base sm:text-lg">За вашим запитом нічого не знайдено.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-auto overflow-hidden bg-white/95 backdrop-blur-xs rounded-lg border border-primary/15 shadow-md transition-all duration-300">
      <div className="px-4 sm:px-6 py-4 text-xs uppercase bg-primary/5 border-b border-primary/15 text-primary font-bold tracking-wider">
        Збіг у файлі ({validItems.length})
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-4 h-auto">
        {validItems.map((item) => (
          <CertificateCard key={item.id} item={item} searchTerm={searchTerm} />
        ))}
      </div>
    </div>
  );
});

FilesTable.displayName = 'FilesTable';
