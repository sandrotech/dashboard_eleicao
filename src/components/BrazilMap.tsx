import React, { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { MAP_VIEWBOX, UF_SHAPES } from '../data/brazilMap';
import { UFS, UF_BY_SIGLA } from '../data/geo';
import { useAnimatedViewBox } from '../hooks/useAnimatedViewBox';
import type { Box } from '../hooks/useAnimatedViewBox';
import { firstName, leaderOf } from '../services/mapData';
import type { MapSelection, StatesMap } from '../types/map';

export interface LegendItem {
  nome: string;
  cor: string;
}

interface BrazilMapProps {
  states: StatesMap | null;
  selection: MapSelection;
  onSelect: (s: MapSelection) => void;
  changed: Record<string, number>;
  legend: LegendItem[];
}

const NEUTRAL = '#E2E8F0';
const FULL: Box = { x: 0, y: 0, w: MAP_VIEWBOX.w, h: MAP_VIEWBOX.h };
const RATIO = MAP_VIEWBOX.w / MAP_VIEWBOX.h;

function fitBox(boxes: Box[], pad: number, minSize: number): Box {
  const x0 = Math.min(...boxes.map((b) => b.x));
  const y0 = Math.min(...boxes.map((b) => b.y));
  const x1 = Math.max(...boxes.map((b) => b.x + b.w));
  const y1 = Math.max(...boxes.map((b) => b.y + b.h));
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  let w = Math.max((x1 - x0) * (1 + pad * 2), minSize);
  let h = Math.max((y1 - y0) * (1 + pad * 2), minSize);
  if (w / h > RATIO) h = w / RATIO;
  else w = h * RATIO;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

export const BrazilMap: React.FC<BrazilMapProps> = ({ states, selection, onSelect, changed, legend }) => {
  const [hover, setHover] = useState<string | null>(null);

  const focusSet = useMemo<Set<string> | null>(() => {
    if (selection.kind === 'uf') return UF_SHAPES[selection.uf] ? new Set([selection.uf]) : null;
    if (selection.kind === 'region') {
      return new Set(UFS.filter((u) => u.regiao === selection.id).map((u) => u.sigla));
    }
    return null;
  }, [selection]);

  const target = useMemo<Box>(() => {
    if (!focusSet) return FULL;
    const boxes: Box[] = [...focusSet]
      .map((uf) => UF_SHAPES[uf])
      .filter(Boolean)
      .map((s) => ({ x: s.x, y: s.y, w: s.w, h: s.h }));
    if (boxes.length === 0) return FULL;
    return selection.kind === 'uf' ? fitBox(boxes, 0.45, 170) : fitBox(boxes, 0.1, 220);
  }, [focusSet, selection.kind]);

  const box = useAnimatedViewBox(target);

  const order = useMemo(
    () =>
      Object.keys(UF_SHAPES).sort((a, b) => {
        const fa = focusSet?.has(a) ? 1 : 0;
        const fb = focusSet?.has(b) ? 1 : 0;
        return fa - fb || a.localeCompare(b);
      }),
    [focusSet],
  );

  const labelSize = box.w / 34;
  const showSmallLabels = box.w < 450;

  // Estado atualmente em destaque no tooltip (hover ou selecionado)
  const activeUf = hover || (selection.kind === 'uf' ? selection.uf : null);
  const activeData = activeUf ? states?.[activeUf] : undefined;
  const activeLead = leaderOf(activeData);
  const activePercApurado = activeData?.stats?.percSecoesNum ?? 0;
  const activePercFaltando = Math.max(0, +(100 - activePercApurado).toFixed(2));
  const activeSecoesRestantes = Math.max(0, (activeData?.stats?.totalSecoes ?? 0) - (activeData?.stats?.secoesTotalizadas ?? 0));

  return (
    <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="relative w-full aspect-square max-h-[70vh] lg:aspect-auto lg:h-[min(64vh,640px)] lg:max-h-none">
        <svg
          viewBox={box.x + ' ' + box.y + ' ' + box.w + ' ' + box.h}
          preserveAspectRatio="xMidYMid meet"
          className={'w-full h-full block touch-manipulation select-none' + (states ? '' : ' animate-pulse')}
          role="group"
          aria-label="Mapa do Brasil com resultado e porcentagem de apuração das urnas por estado"
        >
          <rect
            x={-1000}
            y={-1000}
            width={3000}
            height={3000}
            fill="transparent"
            onClick={() => onSelect({ kind: 'br' })}
          />

          {order.map((uf) => {
            const shape = UF_SHAPES[uf];
            const data = states?.[uf];
            const lead = leaderOf(data);
            const isSel = selection.kind === 'uf' && selection.uf === uf;
            const dim = focusSet !== null && !focusSet.has(uf);
            const stamp = changed[uf];
            const flashing = !!stamp && Date.now() - stamp < 4000;
            const nome = UF_BY_SIGLA[uf]?.nome ?? uf;
            const percApurado = data?.stats?.percSecoesNum ?? 0;
            const percFaltando = Math.max(0, +(100 - percApurado).toFixed(2));

            // Graduação de opacidade: estados com poucas urnas apuradas ficam translúcidos,
            // e vão se tornando 100% sólidos conforme a apuração consolida
            const urnasOpacity = lead ? Math.min(1, Math.max(0.48, 0.45 + (percApurado / 100) * 0.55)) : 1;

            const cls = ['map-uf', isSel ? 'map-uf-selected' : '', flashing ? 'map-uf-flash' : '']
              .filter(Boolean)
              .join(' ');
            const label =
              nome +
              (lead
                ? ', ' + percApurado.toFixed(1) + '% apurado (falta ' + percFaltando.toFixed(1) + '%), liderando: ' + firstName(lead.nomeUrna) + ' ' + lead.perc + '%'
                : ', sem votos apurados');
            const pick = () => onSelect(isSel ? { kind: 'br' } : { kind: 'uf', uf });
            return (
              <path
                key={uf + ':' + (stamp ?? 0)}
                d={shape.d}
                fill={lead ? lead.cor : NEUTRAL}
                fillOpacity={lead ? urnasOpacity : 1}
                fillRule="evenodd"
                stroke={isSel ? '#0f172a' : '#ffffff'}
                strokeWidth={isSel ? 2 : 1.2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                className={cls}
                style={{ opacity: dim ? 0.3 : 1 }}
                role="button"
                tabIndex={0}
                aria-label={label}
                aria-pressed={isSel}
                onClick={(e) => {
                  e.stopPropagation();
                  pick();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pick();
                  }
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setHover(uf);
                }}
                onPointerLeave={() => setHover(null)}
              />
            );
          })}

          {order.map((uf) => {
            const shape = UF_SHAPES[uf];
            if (shape.small && !showSmallLabels) return null;
            const data = states?.[uf];
            const percApurado = data?.stats?.percSecoesNum ?? 0;
            const dim = focusSet !== null && !focusSet.has(uf);

            return (
              <g key={'g' + uf} pointerEvents="none" style={{ opacity: dim ? 0.25 : 1, transition: 'opacity .4s ease' }}>
                <text
                  x={shape.cx}
                  y={shape.cy - (percApurado > 0 && box.w < 600 ? labelSize * 0.3 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={labelSize}
                  fontWeight={800}
                  fill="#ffffff"
                  stroke="rgba(15,23,42,0.65)"
                  strokeWidth={labelSize * 0.16}
                  paintOrder="stroke"
                >
                  {uf}
                </text>
                {percApurado > 0 && box.w < 600 && (
                  <text
                    x={shape.cx}
                    y={shape.cy + labelSize * 0.8}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={labelSize * 0.62}
                    fontWeight={700}
                    fill="#fef08a"
                    stroke="rgba(15,23,42,0.8)"
                    strokeWidth={labelSize * 0.12}
                    paintOrder="stroke"
                  >
                    {Math.round(percApurado)}%
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Card flutuante com progresso exato de urnas apuradas e faltantes */}
        {activeUf && activeData && (
          <div className="absolute left-2.5 top-2.5 max-w-[280px] sm:max-w-xs rounded-xl bg-white/95 backdrop-blur-xs p-2.5 text-xs shadow-lg border border-slate-200 anim-fade z-10 space-y-1.5 pointer-events-none sm:pointer-events-auto">
            <div className="flex items-center justify-between gap-1">
              <span className="font-extrabold text-slate-900 text-sm">
                {UF_BY_SIGLA[activeUf]?.nome ?? activeUf} ({activeUf})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                {activeData.stats.percSecoes}% apurado
              </span>
            </div>

            {/* Barra de progresso visual de urnas */}
            <div className="space-y-1">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: activePercApurado + '%' }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                <span className="text-amber-700 font-bold">
                  Falta apurar {activePercFaltando.toFixed(2).replace('.', ',')}%
                </span>
                <span className="font-mono-num text-slate-400">
                  {activeSecoesRestantes.toLocaleString('pt-BR')} urnas restantes
                </span>
              </div>
            </div>

            {/* Liderança de votos no estado */}
            <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
              {activeLead ? (
                <span className="font-bold flex items-center gap-1" style={{ color: activeLead.cor }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeLead.cor }}></span>
                  {firstName(activeLead.nomeUrna)} lidera ({activeLead.perc}%)
                </span>
              ) : (
                <span className="text-slate-400">Sem votos apurados</span>
              )}
              {activeData.segundoColocado && (
                <span className="text-slate-500 font-medium">
                  2º: {firstName(activeData.segundoColocado.nomeUrna)} ({activeData.segundoColocado.perc}%)
                </span>
              )}
            </div>
          </div>
        )}

        {selection.kind !== 'br' && (
          <button
            type="button"
            onClick={() => onSelect({ kind: 'br' })}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-md border border-slate-200 hover:bg-white active:scale-95 transition-all anim-fade cursor-pointer z-10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Brasil
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-600">
        {legend.map((l) => (
          <span key={l.nome} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.cor }} />
            {l.nome}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NEUTRAL }} />
          sem votos
        </span>
        <span className="ml-auto text-slate-400 font-medium">
          💡 Cores translúcidas = apuração inicial • Cores sólidas = urnas consolidadas
        </span>
      </div>
    </div>
  );
};