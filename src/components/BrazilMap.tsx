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

/** Caixa que envolve as formas, com folga e tamanho minimo, mantendo a proporcao do mapa. */
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

  // estados em foco desenhados por ultimo (ficam "elevados" sobre os vizinhos)
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
  const hoverData = hover ? states?.[hover] : undefined;
  const hoverLead = leaderOf(hoverData);

  return (
    <div className="relative rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="relative w-full aspect-square max-h-[70vh] lg:aspect-auto lg:h-[min(64vh,640px)] lg:max-h-none">
        <svg
          viewBox={box.x + ' ' + box.y + ' ' + box.w + ' ' + box.h}
          preserveAspectRatio="xMidYMid meet"
          className={'w-full h-full block touch-manipulation select-none' + (states ? '' : ' animate-pulse')}
          role="group"
          aria-label="Mapa do Brasil com o resultado por estado"
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
            const cls = ['map-uf', isSel ? 'map-uf-selected' : '', flashing ? 'map-uf-flash' : '']
              .filter(Boolean)
              .join(' ');
            const label =
              nome + (lead ? ', liderando: ' + firstName(lead.nomeUrna) + ' ' + lead.perc + '%' : ', sem votos apurados');
            const pick = () => onSelect(isSel ? { kind: 'br' } : { kind: 'uf', uf });
            return (
              <path
                key={uf + ':' + (stamp ?? 0)}
                d={shape.d}
                fill={lead ? lead.cor : NEUTRAL}
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
            const dim = focusSet !== null && !focusSet.has(uf);
            return (
              <text
                key={'t' + uf}
                x={shape.cx}
                y={shape.cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={labelSize}
                fontWeight={800}
                fill="#ffffff"
                stroke="rgba(15,23,42,0.55)"
                strokeWidth={labelSize * 0.16}
                paintOrder="stroke"
                pointerEvents="none"
                style={{ opacity: dim ? 0.25 : 1, transition: 'opacity .4s ease' }}
              >
                {uf}
              </text>
            );
          })}
        </svg>

        {hover && (
          <div className="pointer-events-none absolute left-2 top-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs shadow-md border border-slate-200 anim-fade">
            <span className="font-bold text-slate-900">{UF_BY_SIGLA[hover]?.nome ?? hover}</span>
            <span className="text-slate-500"> · </span>
            {hoverLead ? (
              <span className="font-bold" style={{ color: hoverLead.cor }}>
                {firstName(hoverLead.nomeUrna)} {hoverLead.perc}%
              </span>
            ) : (
              <span className="text-slate-500">sem votos apurados</span>
            )}
          </div>
        )}

        {selection.kind !== 'br' && (
          <button
            type="button"
            onClick={() => onSelect({ kind: 'br' })}
            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-md border border-slate-200 hover:bg-white active:scale-95 transition-all anim-fade cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Brasil
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-600">
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
        <span className="ml-auto hidden sm:inline text-slate-400 font-medium">Toque num estado para ver a votação</span>
      </div>
    </div>
  );
};