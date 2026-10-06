import type { FC } from 'react';

export const Header: FC = () => {
  return (
    <header className="w-full border-b border-gray-200 py-8 mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-primary mb-2">
            Реєстр виданих документів про освіту
          </h1>
          <p className="text-gray-500">
            Пошук та завантаження інформації про сертифікати за офіційними реєстрами.
          </p>
        </div>
      </div>
    </header>
  );
};
