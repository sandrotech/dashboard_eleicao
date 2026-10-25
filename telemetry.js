// telemetry.js - Monitor de acessos em tempo real para os logs do Coolify
const http = require('http');

const activeSessions = new Map(); // sessionId -> { ip, userAgent, lastSeen, device }
const uniqueIps = new Set();
let totalPageViews = 0;

function cleanupSessions() {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (now - session.lastSeen > 65000) {
      activeSessions.delete(id);
    }
  }
}

// Emite resumo periódico a cada 30 segundos no stdout do container (visível no painel do Coolify)
setInterval(() => {
  cleanupSessions();
  const onlineCount = activeSessions.size;
  const timestamp = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Fortaleza' });
  console.log(
    `📊 [TELEMETRIA ${timestamp}] Online Agora: ${onlineCount} pessoa(s) | Total de Visitas: ${totalPageViews} | IPs Únicos: ${uniqueIps.size}`
  );
}, 30000);

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/ping') {
    const rawIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '';
    const ip = rawIp.split(',')[0].trim() || 'Desconhecido';
    const ua = req.headers['user-agent'] || '';
    const sid = url.searchParams.get('sid') || ip;
    const isNew = url.searchParams.get('new') === '1';

    let device = 'Desktop';
    if (/android/i.test(ua)) device = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) device = 'iOS (iPhone/iPad)';
    else if (/mobile/i.test(ua)) device = 'Mobile';

    const now = Date.now();
    const timestamp = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Fortaleza' });

    if (isNew || !activeSessions.has(sid)) {
      totalPageViews++;
      uniqueIps.add(ip);
      console.log(`👤 [NOVO ACESSO ${timestamp}] IP: ${ip} | Dispositivo: ${device} | Online agora: ${activeSessions.size + 1}`);
    }

    activeSessions.set(sid, { ip, userAgent: ua, lastSeen: now, device });

    res.writeHead(200);
    return res.end(JSON.stringify({ ok: true, online: activeSessions.size }));
  }

  if (url.pathname === '/api/stats') {
    cleanupSessions();
    res.writeHead(200);
    return res.end(JSON.stringify({
      online: activeSessions.size,
      totalVisits: totalPageViews,
      uniqueIps: uniqueIps.size,
    }));
  }

  res.writeHead(404);
  res.end('Not Found');
});

const PORT = 4000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 [TELEMETRIA] Monitor de acessos ativo na porta ${PORT}`);
});