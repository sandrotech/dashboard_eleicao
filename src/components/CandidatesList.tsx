import React, { useState } from 'react';
import type { Candidate } from '../types/tse';
import { User, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface CandidatesListProps {
  candidatos: Candidate[];
  turno: 1 | 2;
}

export const CandidatesList: React.FC<CandidatesListProps> = ({ candidatos, turno }) => {
  const [isExpanded, setIsExpanded] = useState(turno === 1);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (sqcand: string) => {
    setImgErrors((prev) => ({ ...prev, [sqcand]: true }));
  };

  return (
    <div className='p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between text-left cursor-pointer'
      >
        <div>
          <h3 className='text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5'>
            <span>Ranking de Candidatos</span>
            <span className='px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-semibold'>
              {candidatos.length}
            </span>
          </h3>
        </div>
        <div className='flex items-center gap-1 text-xs text-slate-500 font-medium'>
          <span>{isExpanded ? 'Ocultar' : 'Ver lista completa'}</span>
          {isExpanded ? <ChevronUp className='w-3.5 h-3.5' /> : <ChevronDown className='w-3.5 h-3.5' />}
        </div>
      </button>

      {isExpanded && (
        <div className='mt-3 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-300'>
          {candidatos.map((cand) => (
            <div
              key={cand.sqcand || cand.num}
              className='p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2 hover:bg-slate-100/70 transition-colors'
            >
              <div className='flex items-center gap-2.5 min-w-0'>
                <span className='text-xs font-bold font-mono-num text-slate-400 w-4 text-center shrink-0'>
                  {cand.posicao}º
                </span>

                <div className='w-8 h-8 rounded-full overflow-hidden bg-slate-200 border shrink-0' style={{ borderColor: cand.cor }}>
                  {!imgErrors[cand.sqcand] ? (
                    <img
                      src={cand.foto}
                      alt={cand.nomeUrna}
                      onError={() => handleImgError(cand.sqcand)}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center bg-slate-200 rounded-full'>
                      <User className='w-4 h-4 text-slate-400' />
                    </div>
                  )}
                </div>

                <div className='min-w-0'>
                  <div className='text-xs font-bold text-slate-900 truncate flex items-center gap-1'>
                    <span>{cand.nomeUrna}</span>
                    {cand.eleito && <CheckCircle className='w-3 h-3 text-emerald-600 shrink-0' />}
                  </div>
                  <div className='text-[10px] text-slate-500'>
                    {cand.partido} ({cand.num})
                  </div>
                </div>
              </div>

              <div className='text-right shrink-0'>
                <div className='text-xs font-black font-mono-num' style={{ color: cand.cor }}>
                  {cand.perc}%
                </div>
                <div className='text-[10px] text-slate-400 font-mono-num'>
                  {cand.votosFormatados}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
