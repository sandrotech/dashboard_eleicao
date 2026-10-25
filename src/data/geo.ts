import type { UFInfo } from '../types/tse';

export type RegionId = 'norte' | 'nordeste' | 'centro-oeste' | 'sudeste' | 'sul';

export interface UfMeta {
  sigla: string; // maiúsculo: 'BA'
  nome: string;
  regiao: RegionId;
  ibge: string; // código IBGE da UF
}

export const REGIONS: { id: RegionId; nome: string }[] = [
  { id: 'norte', nome: 'Norte' },
  { id: 'nordeste', nome: 'Nordeste' },
  { id: 'centro-oeste', nome: 'Centro-Oeste' },
  { id: 'sudeste', nome: 'Sudeste' },
  { id: 'sul', nome: 'Sul' },
];

export const UFS: UfMeta[] = [
  { sigla: 'AC', nome: 'Acre', regiao: 'norte', ibge: '12' },
  { sigla: 'AL', nome: 'Alagoas', regiao: 'nordeste', ibge: '27' },
  { sigla: 'AP', nome: 'Amapá', regiao: 'norte', ibge: '16' },
  { sigla: 'AM', nome: 'Amazonas', regiao: 'norte', ibge: '13' },
  { sigla: 'BA', nome: 'Bahia', regiao: 'nordeste', ibge: '29' },
  { sigla: 'CE', nome: 'Ceará', regiao: 'nordeste', ibge: '23' },
  { sigla: 'DF', nome: 'Distrito Federal', regiao: 'centro-oeste', ibge: '53' },
  { sigla: 'ES', nome: 'Espírito Santo', regiao: 'sudeste', ibge: '32' },
  { sigla: 'GO', nome: 'Goiás', regiao: 'centro-oeste', ibge: '52' },
  { sigla: 'MA', nome: 'Maranhão', regiao: 'nordeste', ibge: '21' },
  { sigla: 'MT', nome: 'Mato Grosso', regiao: 'centro-oeste', ibge: '51' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', regiao: 'centro-oeste', ibge: '50' },
  { sigla: 'MG', nome: 'Minas Gerais', regiao: 'sudeste', ibge: '31' },
  { sigla: 'PA', nome: 'Pará', regiao: 'norte', ibge: '15' },
  { sigla: 'PB', nome: 'Paraíba', regiao: 'nordeste', ibge: '25' },
  { sigla: 'PR', nome: 'Paraná', regiao: 'sul', ibge: '41' },
  { sigla: 'PE', nome: 'Pernambuco', regiao: 'nordeste', ibge: '26' },
  { sigla: 'PI', nome: 'Piauí', regiao: 'nordeste', ibge: '22' },
  { sigla: 'RJ', nome: 'Rio de Janeiro', regiao: 'sudeste', ibge: '33' },
  { sigla: 'RN', nome: 'Rio Grande do Norte', regiao: 'nordeste', ibge: '24' },
  { sigla: 'RS', nome: 'Rio Grande do Sul', regiao: 'sul', ibge: '43' },
  { sigla: 'RO', nome: 'Rondônia', regiao: 'norte', ibge: '11' },
  { sigla: 'RR', nome: 'Roraima', regiao: 'norte', ibge: '14' },
  { sigla: 'SC', nome: 'Santa Catarina', regiao: 'sul', ibge: '42' },
  { sigla: 'SP', nome: 'São Paulo', regiao: 'sudeste', ibge: '35' },
  { sigla: 'SE', nome: 'Sergipe', regiao: 'nordeste', ibge: '28' },
  { sigla: 'TO', nome: 'Tocantins', regiao: 'norte', ibge: '17' },
];

export const UF_BY_SIGLA: Record<string, UfMeta> = Object.fromEntries(
  UFS.map((u) => [u.sigla, u]),
);

export const UF_BY_IBGE: Record<string, UfMeta> = Object.fromEntries(
  UFS.map((u) => [u.ibge, u]),
);

export const regionOf = (sigla: string): RegionId | undefined =>
  UF_BY_SIGLA[sigla.toUpperCase()]?.regiao;

export const regionName = (id: RegionId): string =>
  REGIONS.find((r) => r.id === id)?.nome ?? id;

/** Lista usada pelo seletor de UF da Navbar (Brasil primeiro, depois A-Z). */
export const BRAZILIAN_STATES: UFInfo[] = [
  { sigla: 'br', nome: 'Brasil (Total)' },
  ...UFS.map((u) => ({ sigla: u.sigla.toLowerCase(), nome: u.nome })),
  { sigla: 'zz', nome: 'Exterior' },
];
