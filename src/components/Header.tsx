import { memo } from 'react';
import type { FC } from 'react';

const MarqueeBlock: FC = () => (
  <div className="flex items-center gap-16 px-8 shrink-0">
    {/* Частина 1: Каразінський університет */}
    <div className="flex items-center gap-4">
      <img
        src="/logoofuniversity.jpg"
        alt="karazin"
        className="h-24 w-auto object-contain shrink-0"
      />
      <div className="flex flex-col justify-center items-start">
        <span className="text-2xl sm:text-[26px] font-bold font-heading tracking-wider text-[#EBCA88] uppercase leading-tight">
          КАРАЗІНСЬКИЙ УНІВЕРСИТЕТ
        </span>
        <span className="text-sm sm:text-[15px] font-light italic text-[#EBCA88] tracking-widest mt-1.5">
          КЛАСИКА, ЩО ВИПЕРЕДЖАЄ ЧАС
        </span>
      </div>
    </div>

    {/* Частина 2: Інститут */}
    <div className="flex items-center gap-4">
      {/* Пропорційно вирівняний щит інституту: видима частина щита (~68.5% висоти PNG) у h-32 (128px) зі зсувом translate-y-3.5 (14px) точно збігається за висотою (~88-90px) і вертикальною віссю з гербом університету (h-24) */}
      <div className="h-24 w-24 flex items-center justify-center shrink-0">
        <img
          src="/logogold_2.png"
          alt="shield"
          className="h-32 w-auto max-w-none object-contain translate-y-3.5 shrink-0 pointer-events-none select-none"
        />
      </div>
      <div className="flex flex-col items-center justify-center">
        <img
          src="/motto-text.png"
          alt="educatio perpetua"
          className="h-3.5 w-auto object-contain"
        />
        <img
          src="/motto-line.png"
          alt="line"
          className="h-[2px] w-auto my-1 object-contain"
        />
        <img
          src="/title-line1.png"
          alt="інститут безперервної освіти"
          className="h-5 w-auto object-contain"
        />
        <img
          src="/title-line2.png"
          alt="та інноваційного розвитку"
          className="h-5 w-auto mt-1 object-contain"
        />
      </div>
    </div>
  </div>
);

export const Header: FC = memo(() => {
  return (
    <header className="relative z-10 w-full mb-8">
      {/* Головний обгортковий контейнер нескінченної каруселі на строго темно-синьому фоні #002b5c */}
      <div className="w-full overflow-hidden bg-[#002b5c] py-4 relative shadow-md">
        {/* Мінімалістичний делікатний фоновий патерн без засвітів, строго поверх #002b5c */}
        <div
          className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <svg
            className="absolute -left-24 -top-6 w-[130%] h-[140%] opacity-[0.08] animate-header-parallax"
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
        </div>

        {/* Трек для безперервного руху вліво */}
        <div className="relative z-10 flex whitespace-nowrap w-max animate-marquee">
          <MarqueeBlock />
          <MarqueeBlock />
          <MarqueeBlock />
          <MarqueeBlock />
        </div>
      </div>

      {/* Головний заголовок сторінки поза каруселлю на світлому фоні */}
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
