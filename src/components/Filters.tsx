import { useMemo } from 'react';
import type { FC } from 'react';
import type { FileEntry } from '../types';

interface FiltersProps {
  data: FileEntry[];
  selectedYear: string;
  onYearChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
}

export const Filters: FC<FiltersProps> = ({
  data,
  selectedYear,
  onYearChange,
  selectedDate,
  onDateChange,
}) => {
  const years = useMemo(() => {
    const list = data.map((item) => item.year).filter((y) => y !== 'Не вказано');
    return Array.from(new Set(list)).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const dates = useMemo(() => {
    const list = data.map((item) => item.date).filter((d) => d !== 'Не вказано');
    return Array.from(new Set(list)).sort();
  }, [data]);

  const selectClassName =
    'block w-full p-3.5 pr-10 text-sm text-slate-900 border border-slate-200 rounded-lg bg-white/95 shadow-md hover:shadow-lg hover:border-primary/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300 appearance-none cursor-pointer';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
      <div className="flex flex-col relative group">
        <label className="mb-2 text-sm font-semibold text-primary transition-colors duration-300">
          Рік випуску
        </label>
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className={selectClassName}
          >
            <option value="">Всі роки</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
            <option value="Не вказано">Не вказано</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-primary/70 group-hover:text-primary transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col relative group">
        <label className="mb-2 text-sm font-semibold text-primary transition-colors duration-300">
          Точна дата / Період
        </label>
        <div className="relative">
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className={selectClassName}
          >
            <option value="">Всі періоди</option>
            {dates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
            <option value="Не вказано">Не вказано</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-primary/70 group-hover:text-primary transition-all duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
