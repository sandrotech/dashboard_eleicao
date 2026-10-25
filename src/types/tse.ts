export interface Candidate {
  num: string;
  sqcand: string;
  nome: string;
  nomeUrna: string;
  partido: string;
  nomePartido: string;
  vice?: string;
  votos: number;
  votosFormatados: string;
  perc: string;
  percNum: number;
  eleito: boolean;
  situacao: string;
  foto: string;
  cor: string;
  posicao: number;
}

export interface ElectionStats {
  secoesTotalizadas: number;
  totalSecoes: number;
  percSecoes: string;
  percSecoesNum: number;
  
  totalEleitores: number;
  comparecimento: number;
  percComparecimento: string;
  abstencao: number;
  percAbstencao: string;
  
  totalVotos: number;
  votosValidos: number;
  percVotosValidos: string;
  votosBrancos: number;
  percVotosBrancos: string;
  votosNulos: number;
  percVotosNulos: string;
  votosAnulados: number;
  
  dataGeracao: string;
  horaGeracao: string;
  turno: 1 | 2;
  abrangencia: string; // br or UF
  codigoEleicao: string;
  fase: string;
}

export interface ElectionData {
  stats: ElectionStats;
  candidatos: Candidate[];
  lider?: Candidate;
  segundoColocado?: Candidate;
  diferencaVotos: number;
  diferencaPerc: number;
  matematicamenteEleito: boolean;
}

export interface UFInfo {
  sigla: string;
  nome: string;
}
