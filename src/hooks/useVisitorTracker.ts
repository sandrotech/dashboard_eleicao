import { useEffect, useRef } from 'react';

export const useVisitorTracker = () => {
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    // Gera ou recupera um ID de sessão temporário por aba
    let sid = sessionStorage.getItem('_tse_sid');
    if (!sid) {
      sid = 'usr_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('_tse_sid', sid);
    }
    sessionIdRef.current = sid;

    // Ping inicial de novo acesso
    const sendPing = (isNew = false) => {
      try {
        const url = '/api/ping?sid=' + encodeURIComponent(sessionIdRef.current) + (isNew ? '&new=1' : '');
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url);
        } else {
          fetch(url, { cache: 'no-store', keepalive: true }).catch(() => {});
        }
      } catch {
        // Ignora silenciosamente qualquer erro de telemetria
      }
    };

    sendPing(true);

    // Heartbeat a cada 25 segundos enquanto a aba estiver aberta e visível
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendPing(false);
      }
    }, 25000);

    return () => {
      clearInterval(interval);
    };
  }, []);
};