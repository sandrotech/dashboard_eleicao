import type { Candidate, ElectionData, ElectionStats } from '../types/tse';

export { BRAZILIAN_STATES } from '../data/geo';

export const PARTY_COLORS: Record<string, string> = {
  PT: '#EF4444',
  PL: '#2563EB',
  PSD: '#F97316',
  MDB: '#10B981',
  UNIÃO: '#06B6D4',
  PP: '#3B82F6',
  REPUBLICANOS: '#6366F1',
  PSDB: '#1D4ED8',
  PDT: '#DC2626',
  PSOL: '#E11D48',
  NOVO: '#EA580C',
  PODE: '#8B5CF6',
  PSB: '#F59E0B',
  SOLIDARIEDADE: '#F43F5E',
  AVANTE: '#14B8A6',
  PRD: '#0EA5E9',
  DC: '#64748B',
  PCB: '#B91C1C',
  PCO: '#991B1B',
  PSTU: '#7F1D1D',
  UP: '#BE123C',
};

const formatPtBrNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-BR').format(num);
};

const parseTseNumber = (val: string | undefined): number => {
  if (!val) return 0;
  return parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
};

const parseTseFloat = (val: string | undefined): number => {
  if (!val) return 0;
  return parseFloat(val.replace(',', '.')) || 0;
};

export const fetchElectionData = async (turno: 1 | 2 = 2, uf: string = 'br'): Promise<ElectionData> => {
  const cdEleicao = turno === 2 ? '6258' : '6257';
  const ufCode = uf.toLowerCase();

  const proxyUrl = '/tse-api/oficial/ele2026/' + cdEleicao + '/dados/' + ufCode + '/' + ufCode + '-c0001-e00' + cdEleicao + '-u.json';
  const directUrl = 'https://resultados.tse.jus.br/oficial/ele2026/' + cdEleicao + '/dados/' + ufCode + '/' + ufCode + '-c0001-e00' + cdEleicao + '-u.json';

  let response: Response;
  try {
    response = await fetch(proxyUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Proxy error status ' + response.status);
    }
  } catch {
    response = await fetch(directUrl, { cache: 'no-store' });
  }

  if (!response.ok) {
    throw new Error('Falha ao obter dados do TSE (' + response.status + ' ' + response.statusText + ')');
  }

  const raw = await response.json();

  const secoesTotalizadas = parseTseNumber(raw.s?.st);
  const totalSecoes = parseTseNumber(raw.s?.ts);
  const percSecoesNum = parseTseFloat(raw.s?.pst);
  const percSecoes = raw.s?.pst || '0,00';

  const totalEleitores = parseTseNumber(raw.e?.te);
  const comparecimento = parseTseNumber(raw.e?.c);
  const percComparecimento = raw.e?.pc || '0,00';
  const abstencao = parseTseNumber(raw.e?.a);
  const percAbstencao = raw.e?.pa || '0,00';

  const totalVotos = parseTseNumber(raw.v?.tv);
  const votosValidos = parseTseNumber(raw.v?.vv);
  const percVotosValidos = raw.v?.pvv || '0,00';
  const votosBrancos = parseTseNumber(raw.v?.vb);
  const percVotosBrancos = raw.v?.pvb || '0,00';
  const votosNulos = parseTseNumber(raw.v?.vn || raw.v?.tvn);
  const percVotosNulos = raw.v?.ptvn || raw.v?.pvn || '0,00';
  const votosAnulados = parseTseNumber(raw.v?.van);

  const stats: ElectionStats = {
    secoesTotalizadas,
    totalSecoes,
    percSecoes,
    percSecoesNum,
    totalEleitores,
    comparecimento,
    percComparecimento,
    abstencao,
    percAbstencao,
    totalVotos,
    votosValidos,
    percVotosValidos,
    votosBrancos,
    percVotosBrancos,
    votosNulos,
    percVotosNulos,
    votosAnulados,
    dataGeracao: raw.dg || '',
    horaGeracao: raw.hg || '',
    turno,
    abrangencia: ufCode,
    codigoEleicao: cdEleicao,
    fase: raw.f === 'o' ? 'Oficial' : 'Simulado',
  };

  const candidatosList: Candidate[] = [];
  const fotoBaseUrl = '/tse-api/oficial/ele2026/' + cdEleicao + '/fotos/br';

  if (raw.carg && raw.carg[0] && raw.carg[0].agr) {
    raw.carg[0].agr.forEach((agr: any) => {
      if (!agr.par) return;
      agr.par.forEach((par: any) => {
        const siglaPartido = par.sg || '';
        const nomePartido = par.nm || '';
        if (!par.cand) return;

        par.cand.forEach((c: any) => {
          const votos = parseTseNumber(c.vap);
          const percNum = parseTseFloat(c.pvap);
          const vice = c.vs?.[0]?.nmu || c.vs?.[0]?.nm || undefined;
          let cor = PARTY_COLORS[siglaPartido] || '#64748B';
          if (c.n === '13' || (c.nmu && c.nmu.toUpperCase().includes('LULA'))) {
            cor = '#DC2626';
          } else if (c.n === '22' || (c.nmu && c.nmu.toUpperCase().includes('BOLSONARO'))) {
            cor = '#2563EB';
          }

          candidatosList.push({
            num: c.n,
            sqcand: c.sqcand,
            nome: c.nm,
            nomeUrna: c.nmu || c.nm,
            partido: siglaPartido,
            nomePartido,
            vice,
            votos,
            votosFormatados: formatPtBrNumber(votos),
            perc: c.pvap || '0,00',
            percNum,
            eleito: c.e === 's',
            situacao: c.st || (c.e === 's' ? 'Eleito' : ''),
            foto: fotoBaseUrl + '/' + c.sqcand + '.jpeg',
            cor,
            posicao: 0,
          });
        });
      });
    });
  }

  candidatosList.sort((a, b) => b.votos - a.votos);
  candidatosList.forEach((c, idx) => {
    c.posicao = idx + 1;
  });

  const lider = candidatosList[0];
  const segundoColocado = candidatosList[1];
  const diferencaVotos = lider && segundoColocado ? lider.votos - segundoColocado.votos : 0;
  const diferencaPerc = lider && segundoColocado ? +(lider.percNum - segundoColocado.percNum).toFixed(2) : 0;

  let matematicamenteEleito = lider?.eleito || false;
  if (!matematicamenteEleito && lider && segundoColocado && percSecoesNum > 80 && totalEleitores > 0) {
    const projectedValidVotes = totalEleitores * 0.78;
    const remainingEstimatedVotes = Math.max(0, projectedValidVotes - votosValidos);
    if (diferencaVotos > remainingEstimatedVotes) {
      matematicamenteEleito = true;
    }
  }

  return {
    stats,
    candidatos: candidatosList,
    lider,
    segundoColocado,
    diferencaVotos,
    diferencaPerc,
    matematicamenteEleito,
  };
};
