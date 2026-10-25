import type { RegionId } from '../data/geo';
import type { ElectionData } from './tse';

export type MapSelection =
  | { kind: 'br' }
  | { kind: 'region'; id: RegionId }
  | { kind: 'uf'; uf: string };

/** Resultado por UF (sigla maiuscula). 'ZZ' = voto no exterior. */
export type StatesMap = Record<string, ElectionData>;

export type ViewMode = 'resumo' | 'mapa';