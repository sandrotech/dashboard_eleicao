import React, { useState, useEffect } from 'react';
import type { Candidate } from '../types/tse';
import { User, ChevronDown, ChevronUp, Award } from 'lucide-react';

interface CandidateDuelProps {
  cand1?: Candidate;
  cand2?: Candidate;
  diferencaVotos: number;
  diferencaPerc: number;
  matematicamenteEleito: boolean;
  percSecoesNum: number;
}

export const CandidateDuel: React.FC<CandidateDuelProps> = ({
  cand1,
  cand2,
  diferencaVotos,
  diferencaPerc,
  matematicamenteEleito,
}) => {
  const [expandedCand, setExpandedCand] = useState<string | null>(null);
  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  useEffect(() => {
    setImg1Error(false);
  }, [cand1?.num, cand1?.sqcand]);

  useEffect(() => {
    setImg2Error(false);
  }, [cand2?.num, cand2?.sqcand]);

  if (!cand1 || !cand2) return null;

  const formatNum = (n: number) => new Intl.NumberFormat('pt-BR').format(n);

  const toggleExpand = (num: string) => {
    setExpandedCand(expandedCand === num ? null : num);
  };

  const getCandPhoto = (cand: Candidate) => {
    if (cand.num === '13' || (cand.nomeUrna && cand.nomeUrna.toUpperCase().includes('LULA'))) {
      return '/candidates/13.jpeg';
    }
    if (cand.num === '22' || (cand.nomeUrna && cand.nomeUrna.toUpperCase().includes('BOLSONARO'))) {
      return '/candidates/22.jpeg';
    }
    return cand.foto || ('/candidates/' + cand.num + '.jpeg');
  };

  const isElected1 = cand1.eleito || (matematicamenteEleito && cand1.posicao === 1);
  const isElected2 = cand2.eleito || (matematicamenteEleito && cand2.posicao === 1);

  return (
    <div className='space-y-2.5'>
      {matematicamenteEleito && (
        <div className='p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs animate-bounce'>
          <Award className='w-4 h-4 text-emerald-600' />
          <span>{cand1.nomeUrna} está matematicamente eleito(a)!</span>
        </div>
      )}

      <div className='grid grid-cols-2 gap-2.5 sm:gap-3'>
        {/* Candidate 1 */}
        <div
          onClick={() => toggleExpand(cand1.num)}
          className={'p-3 sm:p-4 rounded-2xl bg-white border cursor-pointer select-none transition-all duration-300 relative shadow-xs ' +
            (isElected1
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : cand1.cor === '#DC2626'
              ? 'border-red-200 hover:border-red-400'
              : 'border-blue-200 hover:border-blue-400')}
        >
          <div className='flex items-center justify-between mb-2'>
            <span
              className='px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-xs'
              style={{ backgroundColor: cand1.cor }}
            >
              {cand1.partido} {cand1.num}
            </span>
            <span className='text-[10px] font-bold text-slate-400'>1º Lugar</span>
          </div>

          <div className='flex flex-col items-center text-center my-2'>
            <div
              className='w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 border-2 shadow-xs bg-slate-50 mb-2 transition-transform duration-300 hover:scale-105'
              style={{ borderColor: cand1.cor }}
            >
              {!img1Error ? (
                <img
                  src={getCandPhoto(cand1)}
                  alt={cand1.nomeUrna}
                  onError={() => setImg1Error(true)}
                  className='w-full h-full object-cover rounded-full'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-slate-100 rounded-full'>
                  <User className='w-8 h-8 text-slate-400' />
                </div>
              )}
            </div>

            <h3 className='text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-1'>
              {cand1.nomeUrna}
            </h3>
          </div>

          <div className='text-center my-1.5'>
            <div
              className='text-2xl sm:text-3xl font-black font-mono-num tracking-tight'
              style={{ color: cand1.cor }}
            >
              {cand1.perc}%
            </div>
            <div className='text-[11px] font-medium text-slate-500 font-mono-num mt-0.5'>
              {cand1.votosFormatados} votos
            </div>
          </div>

          <div className='mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-center text-[10px] text-slate-400 gap-1'>
            <span>{expandedCand === cand1.num ? 'Menos dados' : 'Mais dados'}</span>
            {expandedCand === cand1.num ? <ChevronUp className='w-3 h-3' /> : <ChevronDown className='w-3 h-3' />}
          </div>

          {expandedCand === cand1.num && (
            <div className='mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1'>
              <div><strong>Nome:</strong> {cand1.nome}</div>
              {cand1.vice && <div><strong>Vice:</strong> {cand1.vice}</div>}
              <div><strong>Partido:</strong> {cand1.nomePartido || cand1.partido}</div>
              {cand1.situacao && <div><strong>Status:</strong> {cand1.situacao}</div>}
            </div>
          )}
        </div>

        {/* Candidate 2 */}
        <div
          onClick={() => toggleExpand(cand2.num)}
          className={'p-3 sm:p-4 rounded-2xl bg-white border cursor-pointer select-none transition-all duration-300 relative shadow-xs ' +
            (isElected2
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : cand2.cor === '#2563EB'
              ? 'border-blue-200 hover:border-blue-400'
              : 'border-red-200 hover:border-red-400')}
        >
          <div className='flex items-center justify-between mb-2'>
            <span
              className='px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-xs'
              style={{ backgroundColor: cand2.cor }}
            >
              {cand2.partido} {cand2.num}
            </span>
            <span className='text-[10px] font-bold text-slate-400'>2º Lugar</span>
          </div>

          <div className='flex flex-col items-center text-center my-2'>
            <div
              className='w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden p-0.5 border-2 shadow-xs bg-slate-50 mb-2 transition-transform duration-300 hover:scale-105'
              style={{ borderColor: cand2.cor }}
            >
              {!img2Error ? (
                <img
                  src={getCandPhoto(cand2)}
                  alt={cand2.nomeUrna}
                  onError={() => setImg2Error(true)}
                  className='w-full h-full object-cover rounded-full'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-slate-100 rounded-full'>
                  <User className='w-8 h-8 text-slate-400' />
                </div>
              )}
            </div>

            <h3 className='text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-1'>
              {cand2.nomeUrna}
            </h3>
          </div>

          <div className='text-center my-1.5'>
            <div
              className='text-2xl sm:text-3xl font-black font-mono-num tracking-tight'
              style={{ color: cand2.cor }}
            >
              {cand2.perc}%
            </div>
            <div className='text-[11px] font-medium text-slate-500 font-mono-num mt-0.5'>
              {cand2.votosFormatados} votos
            </div>
          </div>

          <div className='mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-center text-[10px] text-slate-400 gap-1'>
            <span>{expandedCand === cand2.num ? 'Menos dados' : 'Mais dados'}</span>
            {expandedCand === cand2.num ? <ChevronUp className='w-3 h-3' /> : <ChevronDown className='w-3 h-3' />}
          </div>

          {expandedCand === cand2.num && (
            <div className='mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1'>
              <div><strong>Nome:</strong> {cand2.nome}</div>
              {cand2.vice && <div><strong>Vice:</strong> {cand2.vice}</div>}
              <div><strong>Partido:</strong> {cand2.nomePartido || cand2.partido}</div>
              {cand2.situacao && <div><strong>Status:</strong> {cand2.situacao}</div>}
            </div>
          )}
        </div>
      </div>

      {/* Tug of war bar & difference card */}
      <div className='p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2'>
        <div className='w-full bg-slate-100 rounded-full h-3 overflow-hidden flex p-0.5'>
          <div
            className='h-full rounded-l-full transition-all duration-700 ease-out'
            style={{ width: Math.max(cand1.percNum, 1) + '%', backgroundColor: cand1.cor }}
          ></div>
          <div
            className='h-full rounded-r-full transition-all duration-700 ease-out'
            style={{ width: Math.max(cand2.percNum, 1) + '%', backgroundColor: cand2.cor }}
          ></div>
        </div>

        <div className='flex items-center justify-between text-xs'>
          <span className='font-bold text-slate-800'>
            Diferença: <span className='text-slate-900 font-mono-num'>+{formatNum(diferencaVotos)} votos</span>
          </span>
          <span className='font-semibold text-slate-500 font-mono-num'>
            {diferencaPerc > 0 ? '+' + diferencaPerc + ' p.p.' : diferencaPerc + ' p.p.'}
          </span>
        </div>
      </div>
    </div>
  );
};