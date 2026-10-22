import type { FC } from 'react';

export const Header: FC = () => {
  return (
    <header className="relative z-10 w-full bg-white/80 backdrop-blur-md border-b border-primary/10 shadow-xs py-6 mb-10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src="/logogold.png"
            alt="Логотип університету"
            className="h-16 sm:h-20 w-auto object-contain shrink-0 drop-shadow-sm transition-all duration-300 hover:scale-105"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-primary tracking-tight">
              Реєстр виданих документів про освіту
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Пошук та завантаження інформації про сертифікати за офіційними реєстрами.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
