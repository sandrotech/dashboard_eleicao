import { useCallback, useEffect, useRef, useState } from 'react';
import { UF_BY_SIGLA } from '../data/geo';
import { beep } from '../lib/alerts';
import { fetchAllStates, firstName, leaderOf } from '../services/mapData';
import type { StatesMap } from '../types/map';

export interface ToastItem {
  id: number;
  text: string;
  color: string;
}

const POLL_MS = 30000;
const TOAST_MS = 7000;

/**
 * Busca as UFs do TSE a cada 30s enquanto `active` (mapa visivel ou alertas ligados).
 * Detecta UFs cuja apuracao mudou (changed) e viradas de lideranca (toasts).
 */
export function useStatesData(turno: 1 | 2, active: boolean, refreshSignal: number, soundOn: boolean) {
  const [states, setStates] = useState<StatesMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const prevRef = useRef<StatesMap | null>(null);
  const turnoRef = useRef<1 | 2>(turno);
  const soundRef = useRef(soundOn);
  const toastId = useRef(0);

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  // trocou de turno: descarta dados antigos para nao gerar falsos alertas
  useEffect(() => {
    setStates(null);
    prevRef.current = null;
    turnoRef.current = turno;
  }, [turno]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await fetchAllStates(turno);
      if (turnoRef.current !== turno) return; // resposta de um turno que ja nao esta ativo
      const prev = prevRef.current;
      if (prev) {
        const ch: Record<string, number> = {};
        const fresh: ToastItem[] = [];
        Object.keys(next).forEach((uf) => {
          const a = prev[uf];
          const b = next[uf];
          if (!a || !b) return;
          if (a.stats.totalVotos !== b.stats.totalVotos) ch[uf] = Date.now();
          const la = leaderOf(a);
          const lb = leaderOf(b);
          if (la && lb && la.num !== lb.num) {
            const nome = uf === 'ZZ' ? 'Exterior' : UF_BY_SIGLA[uf]?.nome ?? uf;
            toastId.current += 1;
            fresh.push({
              id: toastId.current,
              text: nome + ': liderança virou para ' + firstName(lb.nomeUrna),
              color: lb.cor,
            });
          }
        });
        if (Object.keys(ch).length > 0) setChanged((c) => ({ ...c, ...ch }));
        if (fresh.length > 0) {
          setToasts((t) => [...t, ...fresh]);
          if (soundRef.current) beep();
          fresh.forEach((n) =>
            window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== n.id)), TOAST_MS),
          );
        }
      }
      prevRef.current = next;
      setStates(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar os estados.');
    } finally {
      setLoading(false);
    }
  }, [turno]);

  useEffect(() => {
    if (!active) return;
    void load();
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [active, load, refreshSignal]);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return { states, loading, error, changed, toasts, dismiss, reload: load };
}