import { memo, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FC } from 'react';

interface SearchInputProps {
  /** Викликається лише з фінальним (debounced, trimmed) значенням запиту. */
  onSearch: (value: string) => void;
  /** Затримка debounce у мілісекундах. */
  delay?: number;
}

/**
 * Повністю ізольоване поле пошуку.
 * Стан кожної введеної літери живе ТІЛЬКИ тут — батьківський компонент
 * отримує значення лише після паузи у введенні (debounce), тому App
 * не перемальовується на кожне натискання клавіші.
 */
export const SearchInput: FC<SearchInputProps> = memo(({ onSearch, delay = 350 }) => {
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef('');

  // Очищаємо відкладений таймер при демонтажі компонента
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const emit = (next: string) => {
    const trimmed = next.trim();
    // Не тривожимо батька, якщо фінальний запит не змінився (наприклад, додано пробіл)
    if (trimmed === lastSentRef.current) return;
    lastSentRef.current = trimmed;
    onSearch(trimmed);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => emit(next), delay);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setValue('');
    emit('');
  };

  return (
    <div className="relative w-full group">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center transition-all duration-300 group-hover:bg-primary group-hover:text-white group-focus-within:bg-primary group-focus-within:text-accent group-focus-within:scale-105 shadow-2xs">
          <svg
            className="w-4 h-4 transition-transform duration-300"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
      </div>
      <input
        type="text"
        className="block w-full p-4 pl-15 pr-12 text-sm sm:text-base text-slate-900 border border-slate-200 rounded-lg bg-white/95 shadow-md hover:shadow-lg hover:border-primary/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-300 placeholder:text-slate-400"
        placeholder="Введіть прізвище, назву курсу або ключові слова..."
        value={value}
        onChange={handleChange}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Очистити пошук"
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-primary transition-all duration-300 cursor-pointer"
        >
          <span className="w-7 h-7 rounded-full hover:bg-primary/10 flex items-center justify-center transition-all duration-300">
            ✕
          </span>
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = 'SearchInput';

