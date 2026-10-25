import React, { useState } from 'react';
import type { ElectionStats } from '../types/tse';
import { ChevronDown, ChevronUp, CheckCircle, CircleOff, Users } from 'lucide-react';

interface HeaderStatsProps {
  stats: ElectionStats;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({ stats }) => {
  const [showDetails, setShowDetails] = useState(false);
  const formatNum = (n: number) => new Intl.NumberFormat('pt-BR').format(n);

  return (
    <div className='space-y-2.5'>
      <div className='p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs'>
        <div className='flex items-center justify-between mb-1.5'>
          <span className='text-[11px] font-bold text-slate-500 uppercase tracking-wider'>
            Apuração das Urnas
          </span>
          <span className='text-xs font-bold font-mono-num text-slate-700'>
            {formatNum(stats.secoesTotalizadas)} / {formatNum(stats.totalSecoes)}
          </span>
        </div>

        <div className='flex items-baseline justify-between mb-2'>
          <span className='text-3xl sm:text-4xl font-black text-slate-900 font-mono-num tracking-tight'>
            {stats.percSecoes}%
          </span>
          <span className='text-xs text-slate-500 font-medium'>
            urnas apuradas
          </span>
        </div>

        <div className='w-full bg-slate-100 rounded-full h-2.5 overflow-hidden'>
          <div
            className='bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out'
            style={{ width: Math.max(stats.percSecoesNum, 0.5) + '%' }}
          ></div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className='w-full mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer'
        >
          <span>{showDetails ? 'Ocultar detalhes da apuração' : 'Ver detalhes (Válidos, Brancos, Nulos)'}</span>
          {showDetails ? <ChevronUp className='w-3.5 h-3.5 text-slate-400' /> : <ChevronDown className='w-3.5 h-3.5 text-slate-400' />}
        </button>
      </div>

      {showDetails && (
        <div className='grid grid-cols-2 gap-2 animate-in fade-in duration-200'>
          <div className='p-3 rounded-xl bg-white border border-slate-200 shadow-xs'>
            <div className='flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1'>
              <CheckCircle className='w-3 h-3 text-emerald-600' /> Votos Válidos
            </div>
            <div className='text-base font-bold text-slate-900 font-mono-num'>
              {formatNum(stats.votosValidos)}
            </div>
            <div className='text-[10px] text-slate-400 mt-0.5'>{stats.percVotosValidos}% do total</div>
          </div>

          <div className='p-3 rounded-xl bg-white border border-slate-200 shadow-xs'>
            <div className='flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1'>
              <CircleOff className='w-3 h-3 text-slate-400' /> Brancos & Nulos
            </div>
            <div className='text-base font-bold text-slate-900 font-mono-num'>
              {formatNum(stats.votosBrancos + stats.votosNulos)}
            </div>
            <div className='text-[10px] text-slate-400 mt-0.5'>
              Br: {stats.percVotosBrancos}% • Nu: {stats.percVotosNulos}%
            </div>
          </div>

          <div className='p-3 rounded-xl bg-white border border-slate-200 shadow-xs'>
            <div className='flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1'>
              <Users className='w-3 h-3 text-sky-600' /> Total de Votos
            </div>
            <div className='text-base font-bold text-slate-900 font-mono-num'>
              {formatNum(stats.totalVotos)}
            </div>
            <div className='text-[10px] text-slate-400 mt-0.5'>Total apurado</div>
          </div>

          <div className='p-3 rounded-xl bg-white border border-slate-200 shadow-xs'>
            <div className='flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1'>
              <Users className='w-3 h-3 text-slate-400' /> Abstenção
            </div>
            <div className='text-base font-bold text-slate-900 font-mono-num'>
              {stats.percAbstencao}%
            </div>
            <div className='text-[10px] text-slate-400 mt-0.5'>{formatNum(stats.abstencao)} abstenções</div>
          </div>
        </div>
      )}
    </div>
  );
};
