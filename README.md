# 🗳️ Dashboard de Apuração Presidencial - Eleições 2026

Dashboard em tempo real para acompanhamento da apuração da votação para Presidente da República (2º Turno - Lula vs. Flávio Bolsonaro), consumindo dados oficiais da API pública do Tribunal Superior Eleitoral (TSE).

![Dashboard Preview](public/preview.png)

## ✨ Funcionalidades

- **🗺️ Mapa Interativo do Brasil**:
  - Renderização vetorial SVG com todos os 27 estados e Distrito Federal.
  - Coloração dinâmica por candidato na liderança (Vermelho: Lula #13 / Azul: Flávio Bolsonaro #22).
  - Zoom e transição suave por regiões (Norte, Nordeste, Centro-Oeste, Sudeste e Sul).
  - Seleção por clique com dados consolidados da UF.

- **⚔️ Card de Duelo & Projeção**:
  - Fotos oficiais dos candidatos, contagem de votos nominais e porcentagem calculada em tempo real.
  - Indicador de virada e projeção matemática com base nas seções totalizadas.

- **📈 Gráfico de Evolução Temporal (`TimelineChart`)**:
  - Traçado de evolução das curvas percentuais ao longo da apuração com régua de 50% (maioria absoluta).

- **📱 Design Responsivo Mobile-First & Desktop Harmonizado**:
  - Mobile: Layout full-width com abas rápidas ("Duelo & Urnas" / "Mapa do Brasil").
  - Desktop: Grid harmônico em 12 colunas, sem espaço desperdiçado ou compressão visual.

- **🔄 Sincronização em Tempo Real com o TSE**:
  - Atualização automática a cada 15 segundos com fallback resiliente para modo offline / simulação de apuração.

## 🛠️ Tecnologias

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Como Executar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/sandrotech/dashboard_eleicao.git
   cd dashboard_eleicao
   ```

2. Instale as dependências:
   ```bash
   pnpm install
   # ou npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev
   # ou npm run dev
   ```

4. Abra no seu navegador: `http://localhost:5173` ou `http://localhost:5174`

## 📦 Build para Produção

```bash
pnpm build
# ou npm run build
```

---
Desenvolvido para acompanhamento cívico e transparente dos resultados eleitorais.
