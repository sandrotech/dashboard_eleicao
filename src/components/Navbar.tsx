import React from 'react';
import { RefreshCw, MapPin } from 'lucide-react';
import { BRAZILIAN_STATES } from '../data/geo';

interface NavbarProps {
  turno: 1 | 2;
  setTurno: (t: 1 | 2) => void;
  selectedUf: string;
  setSelectedUf: (uf: string) => void;
  refreshInterval: number;
  setRefreshInterval: (ms: number) => void;
  onRefresh: () => void;
  isLoading: boolean;
  lastUpdated: Date | null;
  countdown: number;
  dataGeracaoTse: string;
  horaGeracaoTse: string;
  activeTab?: 'painel' | 'mapa';
  setActiveTab?: (tab: 'painel' | 'mapa') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  turno,
  setTurno,
  selectedUf,
  setSelectedUf,
  refreshInterval,
  onRefresh,
  isLoading,
  countdown,
  dataGeracaoTse,
  horaGeracaoTse,
  activeTab = 'painel',
  setActiveTab,
}) => {
  return (
    <header className='sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs'>
      <div className='w-full max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5'>
        <div className='flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap'>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs shadow-xs font-bold'>
              🗳️
            </div>
            <div>
              <div className='flex items-center gap-1.5'>
                <h1 className='text-xs sm:text-sm font-black tracking-tight text-slate-900 leading-none'>
                  Eleições 2026
                </h1>
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse'></span>
                  AO VIVO
                </span>
              </div>
            </div>
          </div>

          {setActiveTab && (
            <div className='flex lg:hidden items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold order-3 w-full sm:w-auto sm:order-2 justify-center mt-1 sm:mt-0'>
              <button
                type='button'
                onClick={() => setActiveTab('painel')}
                className={'flex-1 sm:flex-initial px-3 py-1 rounded-lg transition-all ' + (activeTab === 'painel' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900')}
              >
                Duelo & Urnas
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('mapa')}
                className={'flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg transition-all ' + (activeTab === 'mapa' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900')}
              >
                <MapPin className='w-3 h-3 text-emerald-600' />
                Mapa do Brasil
              </button>
            </div>
          )}

          <div className='flex items-center gap-1.5 order-2 sm:order-3'>
            <div className='inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px]'>
              <button
                onClick={() => setTurno(2)}
                className={'px-2 py-0.5 rounded-md font-bold transition-all ' + (turno === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900')}
              >
                2º T
              </button>
              <button
                onClick={() => setTurno(1)}
                className={'px-2 py-0.5 rounded-md font-medium transition-all ' + (turno === 1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900')}
              >
                1º T
              </button>
            </div>

            <div className='relative'>
              <select
                value={selectedUf}
                onChange={(e) => setSelectedUf(e.target.value)}
                className='pl-2 pr-5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer appearance-none'
              >
                {BRAZILIAN_STATES.map((st) => (
                  <option key={st.sigla} value={st.sigla}>
                    {st.sigla === 'br' ? 'Brasil' : st.sigla.toUpperCase()}
                  </option>
                ))}
              </select>
              <span className='absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 pointer-events-none'>▼</span>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title='Atualizar dados agora'
              className='p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 border border-slate-200 transition-all cursor-pointer'
            >
              <RefreshCw className={'w-3.5 h-3.5 ' + (isLoading ? 'animate-spin text-emerald-600' : '')} />
            </button>
          </div>
        </div>

        <div className='mt-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400'>
          <span>TSE: {dataGeracaoTse ? dataGeracaoTse + (horaGeracaoTse ? ' às ' + horaGeracaoTse : '') : 'Ao vivo'}</span>
          {refreshInterval > 0 && <span>Auto: {countdown}s</span>}
        </div>
      </div>
    </header>
  );
};
