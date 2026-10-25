import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchElectionData } from './services/tseService';
import type { ElectionData } from './types/tse';
import type { MapSelection } from './types/map';
import { Navbar } from './components/Navbar';
import { HeaderStats } from './components/HeaderStats';
import { CandidateDuel } from './components/CandidateDuel';
import { CandidatesList } from './components/CandidatesList';
import { TimelineChart } from './components/TimelineChart';
import { BrazilMap, type LegendItem } from './components/BrazilMap';
import { useStatesData } from './hooks/useStatesData';
import { REGIONS, UF_BY_SIGLA, type RegionId } from './data/geo';
import { AlertTriangle, RefreshCw, ShieldCheck, MapPin, Compass, ArrowRight, RotateCcw } from 'lucide-react';

const MAP_LEGEND: LegendItem[] = [
  { nome: 'Lula (PT)', cor: '#DC2626' },
  { nome: 'Flávio Bolsonaro (PL)', cor: '#2563EB' },
];

export const App: React.FC = () => {
  const [turno, setTurno] = useState<1 | 2>(2);
  const [selectedUf, setSelectedUf] = useState<string>('br');
  const [selection, setSelection] = useState<MapSelection>({ kind: 'br' });
  const [activeTab, setActiveTab] = useState<'painel' | 'mapa'>('painel');
  const [refreshInterval, setRefreshInterval] = useState<number>(10000);
  const [countdown, setCountdown] = useState<number>(10);
  const [refreshSignal, setRefreshSignal] = useState<number>(0);

  const [data, setData] = useState<ElectionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const prevVotesRef = useRef<number>(0);

  // Carrega dados de todos os estados para o mapa interativo
  const { states, loading: statesLoading, changed } = useStatesData(turno, true, refreshSignal, false);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);

    try {
      const res = await fetchElectionData(turno, selectedUf);
      setData(res);
      setLastUpdated(new Date());

      if (res.stats.totalVotos !== prevVotesRef.current) {
        prevVotesRef.current = res.stats.totalVotos;
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados do TSE:', err);
      setError(err?.message || 'Erro ao conectar à API pública do TSE.');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
      setCountdown(Math.floor(refreshInterval / 1000));
    }
  }, [turno, selectedUf, refreshInterval]);

  useEffect(() => {
    setIsInitialLoading(true);
    loadData(false);
  }, [turno, selectedUf]);

  useEffect(() => {
    if (refreshInterval <= 0) return;

    setCountdown(Math.floor(refreshInterval / 1000));

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : Math.floor(refreshInterval / 1000)));
    }, 1000);

    const pollingTimer = setInterval(() => {
      loadData(true);
      setRefreshSignal((s) => s + 1);
    }, refreshInterval);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(pollingTimer);
    };
  }, [refreshInterval, loadData]);

  // Sincroniza seleção do mapa com o dropdown de UF
  const handleSelectMap = (s: MapSelection) => {
    setSelection(s);
    if (s.kind === 'br') {
      setSelectedUf('br');
    } else if (s.kind === 'uf') {
      setSelectedUf(s.uf.toLowerCase());
    }
  };

  const handleSelectUf = (uf: string) => {
    setSelectedUf(uf);
    if (uf === 'br') {
      setSelection({ kind: 'br' });
    } else {
      setSelection({ kind: 'uf', uf: uf.toUpperCase() });
    }
  };

  const handleRegionClick = (regiaoId: RegionId) => {
    setSelection({ kind: 'region', id: regiaoId });
  };

  // Dados do estado em foco no mapa
  const focusedUfSigla = selection.kind === 'uf' ? selection.uf : selectedUf !== 'br' ? selectedUf.toUpperCase() : null;
  const focusedUfData = focusedUfSigla ? states?.[focusedUfSigla] : null;
  const focusedUfMeta = focusedUfSigla ? UF_BY_SIGLA[focusedUfSigla] : null;

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans'>
      <Navbar
        turno={turno}
        setTurno={setTurno}
        selectedUf={selectedUf}
        setSelectedUf={handleSelectUf}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onRefresh={() => {
          loadData(false);
          setRefreshSignal((s) => s + 1);
        }}
        isLoading={isLoading || statesLoading}
        lastUpdated={lastUpdated}
        countdown={countdown}
        dataGeracaoTse={data?.stats.dataGeracao || ''}
        horaGeracaoTse={data?.stats.horaGeracao || ''}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className='flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-2.5 sm:py-4'>
        {error && (
          <div className='mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between text-xs'>
            <div className='flex items-center gap-2'>
              <AlertTriangle className='w-4 h-4 text-red-600 shrink-0' />
              <div>
                <p className='font-bold'>Falha ao carregar dados do TSE</p>
                <p className='text-[11px] text-red-600'>{error}</p>
              </div>
            </div>
            <button
              onClick={() => loadData(false)}
              className='px-2.5 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-800 font-bold text-[11px] transition-colors cursor-pointer'
            >
              Tentar novamente
            </button>
          </div>
        )}

        {isInitialLoading ? (
          <div className='py-28 flex flex-col items-center justify-center space-y-3'>
            <div className='w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center animate-spin'>
              <RefreshCw className='w-5 h-5 text-slate-600' />
            </div>
            <p className='text-xs font-semibold text-slate-600'>Carregando apuração oficial do TSE...</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-6 items-start'>
            
            {/* COLUNA ESQUERDA: Mapa Interativo do Brasil & Regiões */}
            <section
              className={'lg:col-span-7 space-y-3 ' + (activeTab === 'mapa' ? 'block' : 'hidden lg:block')}
            >
              {/* Barra de Filtros por Região */}
              <div className='p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs'>
                <div className='flex items-center justify-between mb-1.5 px-1'>
                  <span className='text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1'>
                    <Compass className='w-3.5 h-3.5 text-slate-400' />
                    Explorar por Região
                  </span>
                  {selection.kind !== 'br' && (
                    <button
                      onClick={() => handleSelectMap({ kind: 'br' })}
                      className='inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer'
                    >
                      <RotateCcw className='w-3 h-3' />
                      Visão Geral (Brasil)
                    </button>
                  )}
                </div>

                <div className='flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none'>
                  <button
                    onClick={() => handleSelectMap({ kind: 'br' })}
                    className={'px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ' +
                      (selection.kind === 'br'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900')}
                  >
                    Brasil Todo
                  </button>
                  {REGIONS.map((reg) => {
                    const isSelected = selection.kind === 'region' && selection.id === reg.id;
                    return (
                      <button
                        key={reg.id}
                        onClick={() => handleRegionClick(reg.id)}
                        className={'px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ' +
                          (isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900')}
                      >
                        {reg.nome}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Componente Mapa do Brasil */}
              <BrazilMap
                states={states}
                selection={selection}
                onSelect={handleSelectMap}
                changed={changed}
                legend={MAP_LEGEND}
              />

              {/* Card de Informações Rápidas do Estado ou Região Focada */}
              {focusedUfMeta && focusedUfData && (
                <div className='p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between gap-3 animate-in fade-in duration-300'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='px-1.5 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-black text-slate-700'>
                        {focusedUfMeta.sigla}
                      </span>
                      <h4 className='text-sm font-extrabold text-slate-900'>
                        {focusedUfMeta.nome}
                      </h4>
                      <span className='text-[11px] font-semibold text-slate-500'>
                        • Urnas: {focusedUfData.stats.percSecoes}%
                      </span>
                    </div>

                    <div className='flex items-center gap-3 mt-1.5 text-xs font-bold'>
                      {focusedUfData.candidatos.slice(0, 2).map((c) => (
                        <span key={c.num} className='inline-flex items-center gap-1 font-mono-num' style={{ color: c.cor }}>
                          <span className='w-2 h-2 rounded-full' style={{ backgroundColor: c.cor }}></span>
                          {c.nomeUrna}: {c.perc}% ({c.votosFormatados})
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedUf(focusedUfMeta.sigla.toLowerCase());
                      setActiveTab('painel');
                    }}
                    className='shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer'
                  >
                    Ver detalhes
                    <ArrowRight className='w-3.5 h-3.5' />
                  </button>
                </div>
              )}
            </section>

            {/* COLUNA DIREITA: Apuração das Urnas & Duelo dos Candidatos */}
            <section
              className={'lg:col-span-5 space-y-3.5 ' + (activeTab === 'painel' ? 'block' : 'hidden lg:block')}
            >
              {/* Botão de atalho para o mapa no mobile */}
              <div className='lg:hidden p-2 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between'>
                <span className='text-xs font-bold text-slate-700 flex items-center gap-1.5'>
                  <MapPin className='w-3.5 h-3.5 text-emerald-600' />
                  Visualização Geográfica
                </span>
                <button
                  onClick={() => setActiveTab('mapa')}
                  className='text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs cursor-pointer'
                >
                  Abrir Mapa
                </button>
              </div>

              {data && (
                <>
                  <HeaderStats stats={data.stats} />

                  {turno === 2 && data.candidatos.length >= 2 && (
                    <>
                      <CandidateDuel
                        cand1={data.lider}
                        cand2={data.segundoColocado}
                        diferencaVotos={data.diferencaVotos}
                        diferencaPerc={data.diferencaPerc}
                        matematicamenteEleito={data.matematicamenteEleito}
                        percSecoesNum={data.stats.percSecoesNum}
                      />

                      {data.lider && data.segundoColocado && (
                        <TimelineChart
                          cand1Name={data.lider.nomeUrna}
                          cand1Perc={data.lider.percNum}
                          cand1Color={data.lider.cor}
                          cand2Name={data.segundoColocado.nomeUrna}
                          cand2Perc={data.segundoColocado.percNum}
                          cand2Color={data.segundoColocado.cor}
                          percSecoes={data.stats.percSecoesNum}
                          horaGeracao={data.stats.horaGeracao}
                          storageKey={'tse-timeline-' + selectedUf}
                        />
                      )}
                    </>
                  )}

                  <CandidatesList
                    candidatos={data.candidatos}
                    turno={turno}
                  />
                </>
              )}
            </section>

          </div>
        )}
      </main>

      <footer className='border-t border-slate-200/80 bg-white py-3 text-center text-[10px] text-slate-400 mt-auto'>
        <div className='w-full max-w-7xl mx-auto px-4 flex items-center justify-center gap-1.5'>
          <ShieldCheck className='w-3.5 h-3.5 text-emerald-600' />
          <span>Dados Oficiais • Tribunal Superior Eleitoral (TSE)</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
