# CLAUDE.md — CompStat Rio

## Propósito do projeto

O CompStat Rio é uma plataforma de inteligência criminal da Prefeitura do Rio de Janeiro. Ela integra três camadas de dados — **mancha criminal** (onde o crime acontece), **fator urbano** (qual condição ambiental o facilita) e **dinâmica criminal** (como ele acontece) — para construir uma **base descritiva** da situação atual de cada área monitorada. A priorização de intervenções **não** vem de um score gerado por IA de forma opaca ("caixa-preta"), mas sim de um **modelo econométrico preditivo (logit)** que estima onde o crime seria combatido de maneira mais eficiente e como — detalhando o efeito de mudanças na estrutura urbana, no policiamento e em outros fatores sobre a previsão de crime em horizontes de 1, 2 e 4 semanas. A plataforma gera um **Relatório Analítico de Área** auditável em DOCX, com justificativa e citação de fontes, para que a equipe humana valide e tome decisões operacionais. A IA amplifica a análise; a decisão final é sempre humana.

> **Direção do produto:** o cruzamento de dados (o "bingo" existente no código) é útil como ferramenta descritiva, mas o projeto está em transição para que a priorização se baseie em previsão econométrica transparente e auditável, não em scores de IA. Estrutura parcial desse modelo preditivo já existe no frontend (`components/predictive/`).

## Arquitetura

### Backend (`app/backend/`) — FastAPI + DuckDB

- Servidor FastAPI (porta 8010) que lê os CSVs normalizados de `dados_normalizados/silver/` e `dados_normalizados/gold/` via DuckDB (consultas read-only, sem banco persistente).
- **Motor de match** (`match/engine.py`): agrupa ocorrências numa grade espacial (~150m), cruza com fatores urbanos e câmeras via DuckDB Spatial (raio 150m), e monta coincidências com score e proveniência.
- **IA** (`ai/`): síntese de dinâmica criminal e copiloto via Claude (`claude-sonnet-4-6`). O copiloto consulta dados por uma whitelist de queries (nunca SQL livre) e propõe reescritas que o analista aceita ou rejeita.
- **Export** (`export/docx_export.py`): gera o relatório em DOCX no formato dos RELINTs, marcado como "RASCUNHO — validação humana".
- Endpoints sob `/api`: áreas, relatório, coincidências, temporal, copiloto (SSE), export.

### Frontend (`app/frontend/`) — React + Vite + TypeScript + MapLibre

- SPA com mapa interativo (MapLibre), heatmap de ocorrências, polígonos de área, câmeras, fatores e segmentos críticos coloridos por score.
- Painel de coincidências ("bingos") com ProvenanceCard (citação literal, nível de confiança, aviso "indício").
- Copiloto lateral com chat, ferramentas consultáveis e sugestão de reescrita (aceitar/ajustar/rejeitar).
- **Fallback de fixtures**: sem backend, o frontend cai automaticamente para dados de exemplo (fixtures da área 20 — Presidente Vargas). Para forçar: `VITE_USE_FIXTURES=1`.
- O proxy do Vite redireciona `/api` para `127.0.0.1:8010`.

### Pipeline de normalização (`normalizacao/`)

- Três etapas: **silver** (transforma fontes brutas em esquema canônico com point-in-polygon nas 8 áreas FM), **gold** (agregados por área para o match consumir) e **LLM** (extração estruturada de dinâmica criminal dos RELINTs e Disque Denúncia, com citação e confiança).
- Corrige problemas conhecidos dos dados: encoding latin-1 do Disque Denúncia, coordenadas invertidas dos fatores urbanos, anos corrompidos nas ocorrências, geometrias fora do bbox do Rio no domínio territorial.
- Saída em `dados_normalizados/silver/` e `dados_normalizados/gold/`.

### Como se conectam

```
dados/ (brutos) → normalizacao/ (silver → gold → LLM) → dados_normalizados/
                                                              ↓
                                                    app/backend/ (FastAPI + DuckDB)
                                                              ↓  /api
                                                    app/frontend/ (React + MapLibre)
```

## Como rodar localmente

### Pré-requisitos

- O `.venv` Python na raiz do repo (já configurado).
- A variável `ANTHROPIC_API_KEY` no arquivo `.env` na raiz (gitignored).

### Backend (porta 8010)

```powershell
# A partir da raiz do repo (Windows/PowerShell):
$env:PYTHONPATH = (Get-Location).Path
.venv\Scripts\uvicorn app.backend.main:app --host 127.0.0.1 --port 8010
```

```bash
# Linux/Mac:
PYTHONPATH="$PWD" .venv/bin/uvicorn app.backend.main:app --host 127.0.0.1 --port 8010
```

A porta 8010 é usada porque a 8000 pode estar ocupada por containers Docker.

### Frontend (porta 5173)

```bash
npm --prefix app/frontend run dev
```

Abre em **http://localhost:5173**. O proxy do Vite redireciona `/api` para o backend.

### Fallback de fixtures

Sem o backend no ar, o frontend cai automaticamente para fixtures (dados de exemplo da área Presidente Vargas). Para forçar fixtures mesmo com backend ativo:

```bash
VITE_USE_FIXTURES=1 npm --prefix app/frontend run dev
```

## Guardrails de IA responsável

1. **Decisão final sempre humana.** O sistema gera rascunho + score + justificativa; a equipe valida antes de agir. O relatório exportado é marcado como "RASCUNHO".
2. **Foco no ambiente, não no indivíduo.** O modelo analisa fatores urbanos (poste apagado, calçada estreita, vegetação) e alocação de patrulha — nunca vigilância de pessoas.
3. **Texto livre é indício, não fato.** Disque Denúncia e RELINT sempre citam a fonte, sinalizam o nível de confiança e marcam que são indícios.
4. **Nunca inventar dado.** Camada ausente é declarada; score com dado insuficiente recebe "baixa confiança".
5. **Sempre citar a fonte.** Toda conclusão qualitativa da IA vem com proveniência rastreável (ProvenanceCard).
6. **LGPD.** Dados tratados como agregados territoriais; dados pessoais minimizados (Disque Denúncia, CPSR). O copiloto nunca tem acesso a SQL livre — só consultas da whitelist.

## Como trabalhar comigo

- **Linguagem clara.** Quem me instrui não é desenvolvedor. Explico tudo em português simples, sem jargão desnecessário, e digo o que cada mudança faz e por quê.
- **Só o que foi pedido.** Nunca faço alterações além do que foi explicitamente solicitado. Se identificar algo a mais que valha a pena, sugiro primeiro e espero confirmação.
- **Cuidado com ações destrutivas.** Antes de qualquer ação irreversível (apagar arquivos, reescrever dados, force push, resetar git), paro e peço confirmação explicando o risco.
- **Commits pequenos e claros.** Mensagens de commit em português, focadas e descritivas. Nunca faço push para um remoto sem que me peçam.
- **Perguntar na dúvida.** Se uma instrução estiver ambígua ou tiver mais de um caminho razoável, pergunto antes de escolher, explicando as opções de forma simples.
