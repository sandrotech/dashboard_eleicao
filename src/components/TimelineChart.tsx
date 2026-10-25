import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

export interface TimelinePoint {
  time: string;
  urnas: number;
  p1: number;
  p2: number;
}

interface TimelineChartProps {
  cand1Name: string;
  cand1Perc: number;
  cand1Color: string;
  cand2Name: string;
  cand2Perc: number;
  cand2Color: string;
  percSecoes: number;
  horaGeracao: string;
  storageKey?: string;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({
  cand1Name,
  cand1Perc,
  cand1Color,
  cand2Name,
  cand2Perc,
  cand2Color,
  percSecoes,
  horaGeracao,
  storageKey = 'tse-timeline',
}) => {
  const [history, setHistory] = useState<TimelinePoint[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      { time: '17:00', urnas: 0.05, p1: 65.2, p2: 34.8 },
      { time: '17:03', urnas: 0.12, p1: 61.4, p2: 38.6 },
      { time: '17:06', urnas: Math.max(percSecoes, 0.25), p1: cand1Perc, p2: cand2Perc },
    ];
  });

  const [activeHover, setActiveHover] = useState<TimelinePoint | null>(null);

  useEffect(() => {
    if (!horaGeracao || cand1Perc <= 0) return;
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.time === horaGeracao && last.p1 === cand1Perc && last.p2 === cand2Perc) {
        return prev;
      }
      const updated = [...prev, { time: horaGeracao, urnas: percSecoes, p1: cand1Perc, p2: cand2Perc }];
      const trimmed = updated.slice(-20);
      try {
        localStorage.setItem(storageKey, JSON.stringify(trimmed));
      } catch {
        // ignore
      }
      return trimmed;
    });
  }, [horaGeracao, cand1Perc, cand2Perc, percSecoes, storageKey]);

  const width = 500;
  const height = 180;
  const padL = 36;
  const padR = 20;
  const padT = 20;
  const padB = 28;

  const chartW = width - padL - padR;
  const chartH = height - padT - padB;

  const minY = 20;
  const maxY = 80;

  const getX = (idx: number, total: number) => {
    if (total <= 1) return padL + chartW / 2;
    return padL + (idx / (total - 1)) * chartW;
  };

  const getY = (val: number) => {
    const clamped = Math.max(minY, Math.min(maxY, val));
    return padT + chartH - ((clamped - minY) / (maxY - minY)) * chartH;
  };

  const path1 = useMemo(() => {
    if (history.length === 0) return '';
    return history
      .map((pt, i) => (i === 0 ? 'M ' : 'L ') + getX(i, history.length).toFixed(1) + ' ' + getY(pt.p1).toFixed(1))
      .join(' ');
  }, [history]);

  const path2 = useMemo(() => {
    if (history.length === 0) return '';
    return history
      .map((pt, i) => (i === 0 ? 'M ' : 'L ') + getX(i, history.length).toFixed(1) + ' ' + getY(pt.p2).toFixed(1))
      .join(' ');
  }, [history]);

  return (
    <div className='p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs'>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-1.5'>
          <TrendingUp className='w-4 h-4 text-slate-700' />
          <h3 className='text-xs font-bold text-slate-900 uppercase tracking-wider'>
            Evolução da Apuração
          </h3>
        </div>
        <span className='text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full'>
          Linha do Tempo
        </span>
      </div>

      <div className='relative w-full aspect-[2.7/1] sm:aspect-[2.9/1]'>
        <svg
          viewBox={'0 0 ' + width + ' ' + height}
          className='w-full h-full overflow-visible touch-manipulation select-none'
        >
          {[30, 40, 50, 60, 70].map((v) => {
            const y = getY(v);
            return (
              <g key={v}>
                <line
                  x1={padL}
                  y1={y}
                  x2={width - padR}
                  y2={y}
                  stroke={v === 50 ? '#94A3B8' : '#F1F5F9'}
                  strokeWidth={1}
                  strokeDasharray={v === 50 ? '3 3' : undefined}
                />
                <text
                  x={padL - 6}
                  y={y}
                  textAnchor='end'
                  dominantBaseline='central'
                  fontSize='9'
                  fill={v === 50 ? '#64748B' : '#94A3B8'}
                  fontWeight={v === 50 ? '700' : '500'}
                >
                  {v}%
                </text>
              </g>
            );
          })}

          <path
            d={path1}
            fill='none'
            stroke={cand1Color}
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />

          <path
            d={path2}
            fill='none'
            stroke={cand2Color}
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          />

          {history.map((pt, i) => {
            const x = getX(i, history.length);
            const y1 = getY(pt.p1);
            const y2 = getY(pt.p2);
            return (
              <g
                key={i}
                className='cursor-pointer'
                onPointerEnter={() => setActiveHover(pt)}
                onClick={() => setActiveHover(pt)}
              >
                <circle cx={x} cy={y1} r='3.5' fill='#ffffff' stroke={cand1Color} strokeWidth='2' />
                <circle cx={x} cy={y2} r='3.5' fill='#ffffff' stroke={cand2Color} strokeWidth='2' />
                <text
                  x={x}
                  y={height - 6}
                  textAnchor='middle'
                  fontSize='8.5'
                  fill='#64748B'
                  fontWeight='600'
                >
                  {pt.time}
                </text>
              </g>
            );
          })}
        </svg>

        {activeHover && (
          <div className='absolute left-1/2 -top-1 -translate-x-1/2 bg-slate-900/95 text-white px-2.5 py-1 rounded-lg text-[10px] shadow-lg border border-slate-700 flex items-center gap-2 pointer-events-none anim-fade'>
            <span className='font-bold text-slate-300'>{activeHover.time}</span>
            <span className='font-bold' style={{ color: '#FCA5A5' }}>
              {cand1Name}: {activeHover.p1}%
            </span>
            <span>•</span>
            <span className='font-bold' style={{ color: '#93C5FD' }}>
              {cand2Name}: {activeHover.p2}%
            </span>
            <span className='text-slate-400 font-mono-num'>({activeHover.urnas}% urnas)</span>
          </div>
        )}
      </div>

      <div className='flex items-center justify-between border-t border-slate-100 pt-2 mt-1 text-[11px] font-semibold text-slate-600'>
        <div className='flex items-center gap-3'>
          <span className='inline-flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: cand1Color }} />
            {cand1Name}: <strong className='font-mono-num'>{cand1Perc}%</strong>
          </span>
          <span className='inline-flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full' style={{ backgroundColor: cand2Color }} />
            {cand2Name}: <strong className='font-mono-num'>{cand2Perc}%</strong>
          </span>
        </div>
        <span className='text-[10px] text-slate-400'>Linha 50% = Maioria</span>
      </div>
    </div>
  );
};
