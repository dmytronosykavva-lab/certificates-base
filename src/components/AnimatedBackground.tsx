import { memo } from 'react';
import type { FC } from 'react';

/**
 * Динамічний інноваційний фон: нейронні зв'язки та цифровий потік.
 * Не має пропсів і обгорнутий у memo — React ніколи не перебудовує це SVG-дерево
 * при оновленнях стану в App.
 */
export const AnimatedBackground: FC = memo(() => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary/5 blur-3xl animate-pulse-slow" />

      {/* Перший шар геометричних ліній і вузлів */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 animate-neural-drift"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="karazinLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#123274" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#123274" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#123274" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <g stroke="url(#karazinLineGrad)" strokeWidth="1.2" fill="none">
          <path d="M-50,180 L220,90 L480,210 L760,110 L1050,240 L1320,130 L1520,220" />
          <path d="M120,420 L380,310 L640,450 L920,340 L1210,470 L1490,360" />
          <path d="M-30,680 L260,570 L540,710 L830,590 L1140,720 L1460,610" />
          <line x1="220" y1="90" x2="380" y2="310" />
          <line x1="480" y1="210" x2="640" y2="450" />
          <line x1="760" y1="110" x2="920" y2="340" />
          <line x1="1050" y1="240" x2="1210" y2="470" />
          <line x1="380" y1="310" x2="260" y2="570" />
          <line x1="640" y1="450" x2="540" y2="710" />
          <line x1="920" y1="340" x2="830" y2="590" />
          <line x1="1210" y1="470" x2="1140" y2="720" />
        </g>
        <g fill="#123274" fillOpacity="0.18">
          <circle cx="220" cy="90" r="3.5" />
          <circle cx="480" cy="210" r="4" />
          <circle cx="760" cy="110" r="3" />
          <circle cx="1050" cy="240" r="4.5" />
          <circle cx="1320" cy="130" r="3.5" />
          <circle cx="380" cy="310" r="4" />
          <circle cx="640" cy="450" r="3.5" />
          <circle cx="920" cy="340" r="4.5" />
          <circle cx="1210" cy="470" r="3.5" />
          <circle cx="260" cy="570" r="3.5" />
          <circle cx="540" cy="710" r="4" />
          <circle cx="830" cy="590" r="3.5" />
          <circle cx="1140" cy="720" r="4" />
        </g>
      </svg>

      {/* Другий зустрічний шар тонких ліній */}
      <svg
        className="absolute inset-0 w-full h-full opacity-20 animate-neural-drift-reverse"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="#123274" strokeOpacity="0.16" strokeWidth="1" fill="none" strokeDasharray="6 6">
          <path d="M80,40 L340,240 L690,150 L980,310 L1290,190" />
          <path d="M40,510 L310,390 L610,540 L950,420 L1310,560" />
        </g>
        <g fill="#f5c95e" fillOpacity="0.35">
          <circle cx="340" cy="240" r="3" />
          <circle cx="690" cy="150" r="3.5" />
          <circle cx="980" cy="310" r="3" />
          <circle cx="610" cy="540" r="3.5" />
          <circle cx="950" cy="420" r="3" />
        </g>
      </svg>
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

