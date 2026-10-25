let ctx: AudioContext | null = null;

/** Beep curto e suave. Deve ser chamado pelo menos uma vez a partir de um gesto do usuario. */
export function beep(): void {
  try {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = ctx ?? new AC();
    if (ctx.state === 'suspended') void ctx.resume();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.setValueAtTime(880, t + 0.14);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  } catch {
    /* audio indisponivel: ignora */
  }
}