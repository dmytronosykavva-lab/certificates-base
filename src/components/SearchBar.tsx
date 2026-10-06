import type { FC } from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SearchBar: FC<SearchBarProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
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
      <input
        type="text"
        className="block w-full p-4 pl-12 text-sm text-gray-900 border border-gray-200 rounded-[7px] bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-colors"
        placeholder="Введіть прізвище, назву курсу або ключові слова..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};
