import { memo } from 'react';
import type { FC } from 'react';

export const Header: FC = memo(() => {
  return (
    <header className="relative z-10 w-full mb-8">
      {/* Головна темно-синя шапка зі статичним адаптивним контентом та живим фоном */}
      <div className="relative w-full overflow-hidden bg-[#002b5c] py-5 shadow-md">
        {/* === ФОНОВИЙ ШАР (z-0): сітка сузір'їв, делікатні частинки та хвилі на строгому #002b5c === */}
        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          {/* Рухома технологічна сітка сузір'їв */}
          <svg
            className="absolute -left-24 -top-6 w-[130%] h-[140%] opacity-[0.09] animate-header-parallax"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="header-minimal-constellation"
                width="220"
                height="120"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 28 32 L 88 58 L 152 26 L 194 78 L 118 96 L 44 84 Z"
                  stroke="#ebca88"
                  strokeWidth="0.75"
                  fill="none"
                />
                <path
                  d="M 88 58 L 118 96 M 152 26 L 220 50"
                  stroke="#93c5fd"
                  strokeWidth="0.55"
                  fill="none"
                />
                <circle cx="28" cy="32" r="1.6" fill="#ebca88" />
                <circle cx="88" cy="58" r="1.8" fill="#93c5fd" />
                <circle cx="152" cy="26" r="1.6" fill="#ebca88" />
                <circle cx="194" cy="78" r="1.5" fill="#93c5fd" />
                <circle cx="118" cy="96" r="1.6" fill="#ebca88" />
                <circle cx="44" cy="84" r="1.4" fill="#93c5fd" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#header-minimal-constellation)" />
          </svg>

          {/* Делікатні геометричні частинки та імпульси */}
          <div className="absolute top-3 left-[18%] w-3 h-3 bg-[#ebca88]/15 border border-[#ebca88]/30 rotate-45 animate-header-particle" />
          <div
            className="absolute bottom-3 left-[46%] w-24 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-[#ebca88]/35 to-transparent animate-header-wave"
          />
          <div
            className="absolute top-4 right-[22%] w-3.5 h-3.5 rounded-full bg-blue-300/10 border border-blue-300/25 animate-header-particle"
            style={{ animationDelay: '-5s' }}
          />
        </div>

        {/* === ГОЛОВНИЙ КОНТЕНТ ШАПКИ (z-10): без каруселі, адаптивна статика === */}
        <div className="relative z-10 flex flex-col xl:flex-row justify-between items-center w-full px-4 md:px-8 gap-8">
          {/* Лівий блок: Каразінський університет */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <img
              src="/logoofuniversity.jpg"
              alt="karazin"
              className="h-24 w-auto object-contain shrink-0 select-none"
            />
            <div className="flex flex-col justify-center items-center sm:items-start">
              <span className="text-xl sm:text-2xl md:text-[26px] font-bold font-heading tracking-wider text-[#EBCA88] uppercase leading-tight">
                КАРАЗІНСЬКИЙ УНІВЕРСИТЕТ
              </span>
              <span className="text-xs sm:text-sm md:text-[15px] font-light italic text-[#EBCA88] tracking-widest mt-1.5">
                КЛАСИКА, ЩО ВИПЕРЕДЖАЄ ЧАС
              </span>
            </div>
          </div>

          {/* Правий блок: Інститут безперервної освіти та інноваційного розвитку */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Пропорційно вирівняний щит інституту (візуально дорівнює гербу університету h-24) */}
            <div className="h-24 w-24 flex items-center justify-center shrink-0">
              <img
                src="/logogold_2.png"
                alt="shield"
                className="h-32 w-auto max-w-none object-contain translate-y-3.5 shrink-0 pointer-events-none select-none"
              />
            </div>

            {/* Ідеально відцентрована по осі стопка з 4-х картинок інституту */}
            <div className="flex flex-col items-center justify-center">
              <img
                src="/motto-text.png"
                alt="educatio perpetua"
                className="h-3 sm:h-3.5 w-auto object-contain select-none"
              />
              <img
                src="/motto-line.png"
                alt="line"
                className="h-[2px] w-auto my-1 object-contain select-none"
              />
              <img
                src="/title-line1.png"
                alt="інститут безперервної освіти"
                className="h-4 sm:h-5 w-auto object-contain select-none"
              />
              <img
                src="/title-line2.png"
                alt="та інноваційного розвитку"
                className="h-4 sm:h-5 w-auto mt-1 object-contain select-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Головний заголовок сторінки під темно-синьою шапкою на світлому фоні */}
      <div className="w-full bg-white/85 backdrop-blur-md border-b border-primary/10 py-6 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-primary mb-2">
            Реєстр виданих документів про освіту
          </h1>
          <p className="text-slate-500 text-sm sm:text-base">
            Пошук інформації про сертифікати за офіційними реєстрами
          </p>
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';
