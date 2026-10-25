import { UFS } from '../data/geo';
import type { Candidate, ElectionData, ElectionStats } from '../types/tse';
import type { StatesMap } from '../types/map';
import { fetchElectionData } from './tseService';

/** Codigo do voto no exterior nos arquivos do TSE. */
export const EXTERIOR = 'ZZ';

/** Todas as UFs + exterior (soma = Brasil). */
export const ALL_CODES: string[] = [...UFS.map((u) => u.sigla), EXTERIOR];

export const fmtNum = (n: number): string => new Intl.NumberFormat('pt-BR').format(n);
export const fmtPct = (n: number): string => n.toFixed(2).replace('.', ',');
export const pct = (n: number, d: number): number => (d > 0 ? (n / d) * 100 : 0);

/** 'FLAVIO BOLSONARO' -> 'Flavio' */
export const firstName = (nomeUrna: string): string => {
  const w = (nomeUrna || '').trim().split(/\s+/)[0] || '';
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
};

/** Lider real: precisa ter votos e estar estritamente a frente (empate/zero => sem lider). */
export const leaderOf = (d?: ElectionData | null): Candidate | undefined => {
  if (!d || !d.lider || d.lider.votos <= 0) return undefined;
  if (d.segundoColocado && d.lider.votos <= d.segundoColocado.votos) return undefined;
  return d.lider;
};

/** Busca as 27 UFs + exterior em paralelo. UFs que falharem ficam de fora (nao derrubam o mapa). */
export const fetchAllStates = async (turno: 1 | 2): Promise<StatesMap> => {
  const settled = await Promise.allSettled(
    ALL_CODES.map((uf) => fetchElectionData(turno, uf.toLowerCase())),
  );
  const out: StatesMap = {};
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') out[ALL_CODES[i]] = r.value;
  });
  if (Object.keys(out).length === 0) {
    throw new Error('Não foi possível carregar os estados do TSE.');
  }
  return out;
};

/** Soma varias UFs em um unico ElectionData (regiao ou Brasil). */
export const aggregate = (
  states: StatesMap,
  codes: string[],
  turno: 1 | 2,
  label: string,
): ElectionData | null => {
  const parts = codes.map((c) => states[c]).filter((s): s is ElectionData => !!s);
  if (parts.length === 0) return null;

  const sum = (pick: (s: ElectionStats) => number): number =>
    parts.reduce((acc, p) => acc + pick(p.stats), 0);

  const secoesTotalizadas = sum((s) => s.secoesTotalizadas);
  const totalSecoes = sum((s) => s.totalSecoes);
  const totalEleitores = sum((s) => s.totalEleitores);
  const comparecimento = sum((s) => s.comparecimento);
  const abstencao = sum((s) => s.abstencao);
  const totalVotos = sum((s) => s.totalVotos);
  const votosValidos = sum((s) => s.votosValidos);
  const votosBrancos = sum((s) => s.votosBrancos);
  const votosNulos = sum((s) => s.votosNulos);
  const votosAnulados = sum((s) => s.votosAnulados);

  const byNum = new Map<string, Candidate>();
  parts.forEach((p) =>
    p.candidatos.forEach((c) => {
      const cur = byNum.get(c.num);
      if (cur) cur.votos += c.votos;
      else byNum.set(c.num, { ...c });
    }),
  );

  const list = [...byNum.values()].sort((a, b) => b.votos - a.votos);
  const totalCand = list.reduce((acc, c) => acc + c.votos, 0);
  list.forEach((c, i) => {
    c.posicao = i + 1;
    c.percNum = pct(c.votos, totalCand);
    c.perc = fmtPct(c.percNum);
    c.votosFormatados = fmtNum(c.votos);
    c.eleito = false;
    c.situacao = '';
  });

  const lider = totalCand > 0 ? list[0] : undefined;
  const segundoColocado = totalCand > 0 ? list[1] : undefined;
  const diferencaVotos = lider && segundoColocado ? lider.votos - segundoColocado.votos : 0;
  const diferencaPerc =
    lider && segundoColocado ? +(lider.percNum - segundoColocado.percNum).toFixed(2) : 0;

  const percSecoesNum = pct(secoesTotalizadas, totalSecoes);
  const first = parts[0].stats;

  const stats: ElectionStats = {
    secoesTotalizadas,
    totalSecoes,
    percSecoes: fmtPct(percSecoesNum),
    percSecoesNum,
    totalEleitores,
    comparecimento,
    percComparecimento: fmtPct(pct(comparecimento, totalEleitores)),
    abstencao,
    percAbstencao: fmtPct(pct(abstencao, totalEleitores)),
    totalVotos,
    votosValidos,
    percVotosValidos: fmtPct(pct(votosValidos, totalVotos)),
    votosBrancos,
    percVotosBrancos: fmtPct(pct(votosBrancos, totalVotos)),
    votosNulos,
    percVotosNulos: fmtPct(pct(votosNulos, totalVotos)),
    votosAnulados,
    dataGeracao: first.dataGeracao,
    horaGeracao: first.horaGeracao,
    turno,
    abrangencia: label,
    codigoEleicao: first.codigoEleicao,
    fase: first.fase,
  };

  return {
    stats,
    candidatos: list,
    lider,
    segundoColocado,
    diferencaVotos,
    diferencaPerc,
    matematicamenteEleito: false,
  };
};