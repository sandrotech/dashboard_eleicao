import React, { useEffect } from 'react';
import type { Candidate, ElectionStats } from '../types/tse';
import { Trophy, X, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface WinnerCelebrationModalProps {
  winner: Candidate;
  runnerUp?: Candidate;
  stats: ElectionStats;
  matematicamenteEleito: boolean;
  onClose: () => void;
}

export const WinnerCelebrationModal: React.FC<WinnerCelebrationModalProps> = ({
  winner,
  runnerUp,
  stats,
  matematicamenteEleito,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const getWinnerPhoto = () => {
    if (winner.num === '13' || (winner.nomeUrna && winner.nomeUrna.toUpperCase().includes('LULA'))) {
      return '/candidates/13.jpeg';
    }
    if (winner.num === '22' || (winner.nomeUrna && winner.nomeUrna.toUpperCase().includes('BOLSONARO'))) {
      return '/candidates/22.jpeg';
    }
    return winner.foto || ('/candidates/' + winner.num + '.jpeg');
  };

  const isElected = winner.eleito || winner.situacao?.toLowerCase().includes('eleito') || matematicamenteEleito;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md anim-fade'
      onClick={onClose}
      role='dialog'
      aria-modal='true'
    >
      <div
        className='relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300'
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className='h-3 w-full'
          style={{ backgroundColor: winner.cor }}
        />

        <button
          onClick={onClose}
          className='absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer z-10'
          aria-label='Fechar destaque'
        >
          <X className='w-5 h-5' />
        </button>

        <div className='p-6 sm:p-8 text-center space-y-5'>
          <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black tracking-wider uppercase shadow-xs'>
            <Trophy className='w-4 h-4 text-amber-600' />
            <span>
              {isElected ? 'Presidente da República Eleito' : 'Líder da Apuração Presidencial'}
            </span>
            <Sparkles className='w-4 h-4 text-amber-600' />
          </div>

          <div className='relative inline-block mx-auto'>
            <div
              className='w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden p-1 border-4 shadow-xl bg-slate-50 mx-auto transition-transform duration-300 hover:scale-105'
              style={{ borderColor: winner.cor }}
            >
              <img
                src={getWinnerPhoto()}
                alt={winner.nomeUrna}
                className='w-full h-full object-cover rounded-full'
              />
            </div>
            <div
              className='absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-black text-white shadow-md flex items-center gap-1 shrink-0'
              style={{ backgroundColor: winner.cor }}
            >
              <CheckCircle2 className='w-3.5 h-3.5' />
              <span>{winner.partido} {winner.num}</span>
            </div>
          </div>

          <div className='space-y-1 pt-1'>
            <h2 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight'>
              {winner.nomeUrna}
            </h2>
            <p className='text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wide'>
              {winner.nome}
            </p>
            {winner.vice && (
              <p className='text-xs font-medium text-slate-600'>
                Vice-Presidente: <strong className='text-slate-800'>{winner.vice}</strong>
              </p>
            )}
          </div>

          <div className='p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-around gap-4'>
            <div>
              <div
                className='text-3xl sm:text-4xl font-black font-mono-num tracking-tight'
                style={{ color: winner.cor }}
              >
                {winner.perc}%
              </div>
              <div className='text-xs font-semibold text-slate-500 mt-0.5'>
                Votos Válidos
              </div>
            </div>

            <div className='w-px h-12 bg-slate-200' />

            <div>
              <div className='text-xl sm:text-2xl font-black font-mono-num text-slate-900'>
                {winner.votosFormatados}
              </div>
              <div className='text-xs font-semibold text-slate-500 mt-0.5'>
                Total de Votos
              </div>
            </div>
          </div>

          {runnerUp && (
            <div className='text-xs text-slate-500 font-medium'>
              2º Lugar: <strong className='text-slate-700'>{runnerUp.nomeUrna}</strong> ({runnerUp.partido}) com {runnerUp.perc}% ({runnerUp.votosFormatados} votos)
            </div>
          )}

          <div className='text-xs text-slate-500 space-y-1'>
            <div>
              Status: <strong className='text-emerald-700'>
                {matematicamenteEleito ? 'Vitória Matemática Confirmada' : 'Eleito com base na totalização do TSE'}
              </strong>
            </div>
            <div className='text-[11px] text-slate-400'>
              {stats.secoesTotalizadas.toLocaleString('pt-BR')} de {stats.totalSecoes.toLocaleString('pt-BR')} seções apuradas ({stats.percSecoes}%)
            </div>
          </div>

          <div className='pt-2 flex flex-col sm:flex-row gap-2.5'>
            <button
              onClick={onClose}
              className='w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer'
            >
              <span>Ver Dados Completos da Apuração</span>
              <ArrowRight className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};