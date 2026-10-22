import type { FC } from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar: FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
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
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => onSearchChange('')}
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
};
