import React from 'react';
import { ElectionStats } from '../types/tse';
import { PieChart, CheckCircle2, CircleOff, Users } from 'lucide-react';

interface VotesDistributionProps {
  stats: ElectionStats;
}

export const VotesDistribution: React.FC<VotesDistributionProps> = ({ stats }) => {
  const formatNum = (n: number) => new Intl.NumberFormat('pt-BR').format(n);

  return (
    <div className='glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 shadow-xl'>
      <div className='flex items-center justify-between mb-5'>
        <div>
          <h3 className='text-base font-bold text-white flex items-center gap-2'>
            <PieChart className='w-4 h-4 text-amber-400' />
            <span>Detalhamento dos Votos & Participação</span>
          </h3>
          <p className='text-xs text-slate-400 mt-0.5'>
            Distribuição entre votos válidos nominais, brancos, nulos e taxa de abstenção
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30'>
          <div className='flex items-center justify-between text-xs text-slate-300 mb-2'>
            <span className='flex items-center gap-1.5 font-medium text-emerald-400'>
              <CheckCircle2 className='w-3.5 h-3.5' /> Válidos a Candidatos
            </span>
            <span className='font-bold font-mono-num text-emerald-400'>
              {stats.percVotosValidos}%
            </span>
          </div>
          <div className='text-xl font-bold text-white font-mono-num'>
            {formatNum(stats.votosValidos)}
          </div>
          <div className='w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden'>
            <div className='bg-emerald-500 h-full rounded-full' style={{ width: Math.max(stats.percSecoesNum, 1) + '%' }}></div>
          </div>
        </div>

        <div className='p-4 rounded-xl bg-slate-900/80 border border-slate-800'>
          <div className='flex items-center justify-between text-xs text-slate-300 mb-2'>
            <span className='flex items-center gap-1.5 font-medium text-slate-400'>
              <CircleOff className='w-3.5 h-3.5' /> Brancos ({stats.percVotosBrancos}%) & Nulos ({stats.percVotosNulos}%)
            </span>
          </div>
          <div className='text-xl font-bold text-slate-300 font-mono-num'>
            {formatNum(stats.votosBrancos + stats.votosNulos)}
          </div>
          <div className='w-full bg-slate-800 rounded-full h-1.5 mt-3 flex overflow-hidden'>
            <div className='bg-slate-500 h-full' style={{ width: '50%' }}></div>
            <div className='bg-slate-600 h-full' style={{ width: '50%' }}></div>
          </div>
        </div>

        <div className='p-4 rounded-xl bg-slate-900/80 border border-slate-800'>
          <div className='flex items-center justify-between text-xs text-slate-300 mb-2'>
            <span className='flex items-center gap-1.5 font-medium text-sky-400'>
              <Users className='w-3.5 h-3.5' /> Abstenções
            </span>
            <span className='font-bold font-mono-num text-slate-400'>
              {stats.percAbstencao}%
            </span>
          </div>
          <div className='text-xl font-bold text-white font-mono-num'>
            {formatNum(stats.abstencao)}
          </div>
          <div className='w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden'>
            <div className='bg-sky-500 h-full rounded-full' style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
