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
    const list = data.map((item) => item.year).filter(y => y !== 'Не вказано');
    return Array.from(new Set(list)).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const dates = useMemo(() => {
    const list = data.map((item) => item.date).filter(d => d !== 'Не вказано');
    return Array.from(new Set(list)).sort();
  }, [data]);

  const selectClassName = "block w-full p-3 text-sm text-gray-900 border border-gray-200 rounded-[7px] bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors appearance-none";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="flex flex-col relative">
        <label className="mb-2 text-sm font-semibold text-gray-700">Рік випуску</label>
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
      </div>

      <div className="flex flex-col relative">
        <label className="mb-2 text-sm font-semibold text-gray-700">Точна дата / Період</label>
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
      </div>
    </div>
  );
};
