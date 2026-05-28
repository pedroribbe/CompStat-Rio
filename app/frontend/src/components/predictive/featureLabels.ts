// Tradução dos nomes técnicos dos regressores do modelo logit para rótulos em
// português natural, usada na exibição (ex.: tabela de coeficientes).
//
// Importante: este mapeamento é PURAMENTE DE APRESENTAÇÃO. O nome técnico
// continua sendo o identificador canônico nos CSVs gerados pelo notebook
// (modelo_preditivo/logit_compstat.ipynb) e nos tipos do frontend. Não use
// este rótulo como chave, ID, ou para casar com dados — só para mostrar.
//
// Para regressores cujo nome embute uma categoria variável (efeitos fixos de
// área FM e dummies de ORCRIM), aplicamos uma regra de prefixo. Algumas
// dummies de ORCRIM ganham rótulo mais legível via lookup direto, que tem
// prioridade sobre a regra de prefixo.

const LABELS: Record<string, string> = {
  // Histórico do próprio trecho
  y_lag1: 'Crime no mesmo trecho (1 semana antes)',
  y_lag2: 'Crime no mesmo trecho (2 semanas antes)',
  y_lag4: 'Crime no mesmo trecho (4 semanas antes)',
  y_lag12: 'Crime no mesmo trecho (12 semanas antes)',
  n_crimes_12w: 'Total de crimes nas 12 semanas anteriores',

  // Vizinhança
  W_y_lag1: 'Crime na vizinhança imediata (1 semana antes)',

  // Disque Denúncia
  n_dd_lag1: 'Denúncias do Disque (semana anterior)',

  // Cobertura por câmeras
  n_cameras: 'Câmeras no trecho',
  n_cameras_ring1: 'Câmeras na vizinhança imediata',

  // Fatores urbanos (componentes desagregados)
  n_fat_calcada: 'Fator urbano: calçada',
  n_fat_ilum: 'Fator urbano: iluminação',
  n_fat_lixo: 'Fator urbano: lixo / limpeza urbana',
  n_fat_mobil: 'Fator urbano: mobiliário urbano',
  n_fat_sitrua: 'Fator urbano: situação de rua',
  n_fat_transito: 'Fator urbano: trânsito',
  n_fat_vegetac: 'Fator urbano: vegetação',
  n_fat_total: 'Fator urbano: total',

  // Temporal
  is_holiday_week: 'Semana de feriado',
  week_sin: 'Sazonalidade semanal (componente seno)',
  week_cos: 'Sazonalidade semanal (componente cosseno)',

  // Dummies de ORCRIM — rótulos mais legíveis que a regra genérica de prefixo
  orcrim_CV: 'Domínio: Comando Vermelho',
  orcrim_Milícia: 'Domínio: Milícia',
  orcrim_TCP: 'Domínio: Terceiro Comando Puro (TCP)',
  'orcrim_Sem domínio': 'Domínio: Sem domínio',
}

/**
 * Converte o nome técnico de um regressor (como aparece no CSV) em um rótulo
 * em português para exibição. Aplica, nesta ordem:
 *   1) lookup direto no dicionário LABELS (entradas mais específicas vencem);
 *   2) se começa com "fe_area_", devolve "Área FM: " + sufixo;
 *   3) se começa com "orcrim_", devolve "Domínio: " + sufixo;
 *   4) fallback: devolve o nome técnico cru (sem quebrar).
 */
export function featureLabel(raw: string): string {
  if (raw in LABELS) return LABELS[raw]
  if (raw.startsWith('fe_area_')) return `Área FM: ${raw.slice('fe_area_'.length)}`
  if (raw.startsWith('orcrim_')) return `Domínio: ${raw.slice('orcrim_'.length)}`
  return raw
}
