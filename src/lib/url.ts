import { REGIONS, UF_BY_SIGLA } from '../data/geo';
import type { RegionId } from '../data/geo';
import type { MapSelection, ViewMode } from '../types/map';

export interface InitialState {
  selection: MapSelection;
  turno: 1 | 2;
  view: ViewMode;
}

export function parseInitialState(search: string): InitialState {
  const p = new URLSearchParams(search);
  const turno: 1 | 2 = p.get('turno') === '1' ? 1 : 2;

  let selection: MapSelection = { kind: 'br' };
  const uf = (p.get('uf') || '').toUpperCase();
  const regiao = (p.get('regiao') || '').toLowerCase();
  if (uf && (UF_BY_SIGLA[uf] || uf === 'ZZ')) selection = { kind: 'uf', uf };
  else if (REGIONS.some((r) => r.id === regiao)) selection = { kind: 'region', id: regiao as RegionId };

  const viewParam = p.get('view');
  const view: ViewMode =
    viewParam === 'resumo' ? 'resumo' : viewParam === 'mapa' || selection.kind !== 'br' ? 'mapa' : 'resumo';

  return { selection, turno, view };
}

export function buildQuery(selection: MapSelection, turno: 1 | 2, view: ViewMode): string {
  const p = new URLSearchParams();
  if (turno === 1) p.set('turno', '1');
  if (selection.kind === 'uf') p.set('uf', selection.uf.toLowerCase());
  if (selection.kind === 'region') p.set('regiao', selection.id);
  if (view === 'mapa') p.set('view', 'mapa');
  const s = p.toString();
  return s ? '?' + s : '';
}

export function buildShareUrl(selection: MapSelection, turno: 1 | 2): string {
  return window.location.origin + window.location.pathname + buildQuery(selection, turno, 'mapa');
}