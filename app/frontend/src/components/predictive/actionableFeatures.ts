// Classificação dos regressores do modelo logit em "alavancas de política
// pública" (acionáveis) vs "variáveis estruturais" (úteis para prever, mas
// não orientam intervenção: defasagens do próprio crime, efeitos fixos de
// área, sazonalidade, domínio de facção).
//
// Apenas as ACIONÁVEIS aparecem no painel correspondente. A classificação
// é puramente de apresentação — não muda o modelo nem os CSVs.

export type MagnitudeClass = 'notavel' | 'leve' | 'desprezivel'

export interface ActionableFeature {
  /** Nome técnico, como aparece em coeficientes_logit.csv (chave canônica). */
  raw: string
  /** Rótulo curto para a coluna "Variável". */
  label: string
  /** Categoria do regressor (agrupa visualmente). */
  categoria: 'Fator urbano' | 'Cobertura' | 'Sinal qualitativo'
  /** Órgãos responsáveis pela intervenção sobre esta alavanca. */
  orgaos: string
  /** Nota curta para o gestor — caveat, leitura ou cuidado. */
  nota: string
}

export const ACTIONABLE_FEATURES: ActionableFeature[] = [
  {
    raw: 'n_fat_transito',
    label: 'Trânsito',
    categoria: 'Fator urbano',
    orgaos: 'CET-Rio, GM-Rio, SEOP',
    nota: 'Pontos de retenção, motos no passeio, estacionamento irregular.',
  },
  {
    raw: 'n_fat_calcada',
    label: 'Calçada',
    categoria: 'Fator urbano',
    orgaos: 'Seconserva, SEOP',
    nota: 'Calçada estreita ou obstruída empurrando pedestre para a via.',
  },
  {
    raw: 'n_fat_lixo',
    label: 'Lixo / limpeza',
    categoria: 'Fator urbano',
    orgaos: 'Comlurb',
    nota: 'Entulho ou lixo acumulado obstruindo visibilidade.',
  },
  {
    raw: 'n_fat_ilum',
    label: 'Iluminação',
    categoria: 'Fator urbano',
    orgaos: 'RioLuz',
    nota: 'Trecho mal iluminado.',
  },
  {
    raw: 'n_fat_vegetac',
    label: 'Vegetação',
    categoria: 'Fator urbano',
    orgaos: 'Comlurb',
    nota: 'Vegetação encobrindo iluminação ou visibilidade.',
  },
  {
    raw: 'n_fat_sitrua',
    label: 'Situação de rua',
    categoria: 'Fator urbano',
    orgaos: 'SMAS',
    nota: 'População em situação de rua mapeada.',
  },
  {
    raw: 'n_fat_mobil',
    label: 'Mobiliário urbano',
    categoria: 'Fator urbano',
    orgaos: 'Seconserva',
    nota: 'Mobiliário abandonado servindo como esconderijo.',
  },
  {
    raw: 'n_cameras',
    label: 'Câmeras no trecho',
    categoria: 'Cobertura',
    orgaos: 'CIVITAS, COR',
    nota: 'Cuidado: instalação endógena (câmeras vão onde há crime).',
  },
  {
    raw: 'n_cameras_ring1',
    label: 'Câmeras na vizinhança',
    categoria: 'Cobertura',
    orgaos: 'CIVITAS, COR',
    nota: 'Cuidado: mesma ressalva de endogeneidade.',
  },
  {
    raw: 'n_dd_lag1',
    label: 'Denúncias do Disque (sem. anterior)',
    categoria: 'Sinal qualitativo',
    orgaos: 'Engajamento comunitário',
    nota: 'Sinal-ruído baixo; sinais inconsistentes entre horizontes.',
  },
]

/**
 * Classifica a magnitude de um coeficiente β.
 *   |β| > 0,05            -> "notavel"
 *   0,01 ≤ |β| ≤ 0,05     -> "leve"
 *   |β| < 0,01            -> "desprezivel"
 */
export function classifyMagnitude(beta: number): MagnitudeClass {
  const abs = Math.abs(beta)
  if (abs > 0.05) return 'notavel'
  if (abs >= 0.01) return 'leve'
  return 'desprezivel'
}
