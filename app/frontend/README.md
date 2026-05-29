# CompStat Rio — Frontend

Aplicação web do CompStat Rio: SPA em **React + Vite + TypeScript + MapLibre** que renderiza o Relatório Analítico de Área, o Mapa Preditivo (logit) e o copiloto lateral.

> 🚀 **Esta é uma aplicação para ser executada localmente.** Sem o backend FastAPI no ar (porta 8010), o frontend cai automaticamente em fixtures de demonstração (área Presidente Vargas).

## Como rodar

A partir da **raiz do repositório**:

```bash
# Backend (porta 8010) — Linux/Mac
PYTHONPATH="$PWD" .venv/bin/uvicorn app.backend.main:app --host 127.0.0.1 --port 8010

# Frontend (porta 5173)
npm --prefix app/frontend run dev
```

Para Windows/PowerShell e o passo a passo completo, ver o [README da aplicação](../README.md) e o [CLAUDE.md](../../CLAUDE.md) na raiz.

Abre em **http://localhost:5173** — o proxy do Vite redireciona `/api` para o backend.

## Forçar fixtures (sem backend)

```bash
VITE_USE_FIXTURES=1 npm --prefix app/frontend run dev
```

## Arquitetura

- Mapa interativo (MapLibre) com heatmap, polígonos de área, câmeras e fatores urbanos.
- Painel de coincidências com ProvenanceCard (citação literal e nível de confiança).
- Copiloto lateral com chat, ferramentas consultáveis e sugestão de reescrita.
- Mapa Preditivo (logit) com drivers, métricas e coeficientes em português.

Veja [`src/components/`](src/components/) para a estrutura por seção (S1–S10).

---

Aplicação desenvolvida por **Arthur Vasconcellos**, **Pedro Forlevezi**, **Pedro Ribbe** e **Pedro Rezende** para o **Claude Impact Lab Rio 2026**.
