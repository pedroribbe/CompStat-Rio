// Painel "Alavancas de política pública": filtra os coeficientes do modelo
// para mostrar APENAS as variáveis sobre as quais a Prefeitura pode agir,
// com leitura amigável (direção do efeito, magnitude qualitativa, órgãos
// responsáveis e uma nota curta). Os demais regressores — defasagens do
// próprio crime, efeitos fixos de área, sazonalidade, domínio de facção —
// ficam fora porque são úteis para prever mas não orientam intervenção.
import { useQuery } from '@tanstack/react-query'
import { fetchCoeficientes } from './predictiveData'
import { ACTIONABLE_FEATURES, classifyMagnitude } from './actionableFeatures'

type Dir = 'up' | 'down' | 'flat'

function directionFromBeta(beta: number): Dir {
  if (beta > 0.005) return 'up'
  if (beta < -0.005) return 'down'
  return 'flat'
}

const DIR_LABEL: Record<Dir, string> = {
  up: '↑ aumenta risco',
  down: '↓ reduz risco',
  flat: '≈ neutro',
}

const MAGNITUDE_LABEL = {
  notavel: 'Notável',
  leve: 'Leve',
  desprezivel: 'Desprezível',
} as const

export function ActionableFeaturesPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['pred-coeficientes'],
    queryFn: fetchCoeficientes,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return <p className="pred-state">Carregando alavancas…</p>
  }
  if (isError || !data) {
    return <p className="pred-state pred-state--error">Não foi possível carregar as alavancas.</p>
  }

  // Indexa coeficientes por nome técnico, filtra para acionáveis, ordena por |β_s1|.
  const byRaw = new Map(data.map((c) => [c.feature, c]))
  const rows = ACTIONABLE_FEATURES
    .map((meta) => ({ meta, coef: byRaw.get(meta.raw) }))
    .filter((r): r is { meta: typeof r.meta; coef: NonNullable<typeof r.coef> } => r.coef !== undefined)
    .sort((a, b) => Math.abs(b.coef.betaS1) - Math.abs(a.coef.betaS1))

  return (
    <section className="pred-actionable">
      <header className="pred-actionable__header">
        <h3 className="pred-actionable__title">Alavancas de política pública</h3>
        <span className="chip chip--neutral">Horizonte: T+1 (1 semana)</span>
      </header>
      <p className="pred-actionable__lead">
        Variáveis sobre as quais o município pode agir. Os demais regressores do modelo —
        defasagens do próprio crime, efeitos fixos de área, sazonalidade e domínio de facção —
        são úteis para prever mas não orientam intervenção.
      </p>

      <div className="pred-table-wrap">
        <table className="pred-table">
          <thead>
            <tr>
              <th>Variável</th>
              <th>Categoria</th>
              <th>Direção</th>
              <th>Magnitude*</th>
              <th>Órgãos responsáveis</th>
              <th>Nota</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ meta, coef }) => {
              const dir = directionFromBeta(coef.betaS1)
              const mag = classifyMagnitude(coef.betaS1)
              return (
                <tr key={meta.raw}>
                  <td className="pred-coef__feat">{meta.label}</td>
                  <td>{meta.categoria}</td>
                  <td className={`pred-or pred-or--${dir}`}>{DIR_LABEL[dir]}</td>
                  <td>
                    <span className={`pred-mag pred-mag--${mag}`}>{MAGNITUDE_LABEL[mag]}</span>
                  </td>
                  <td>{meta.orgaos}</td>
                  <td className="pred-actionable__nota">{meta.nota}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="pred-actionable__footnote">
        <strong>*</strong> Categorias de magnitude pelo valor absoluto do coeficiente β:
        {' '}<strong>Notável</strong> |β| &gt; 0,05;
        {' '}<strong>Leve</strong> 0,01 ≤ |β| ≤ 0,05;
        {' '}<strong>Desprezível</strong> |β| &lt; 0,01.
      </p>
      <p className="pred-actionable__caveat">
        Os coeficientes vêm de um modelo preditivo, não de um experimento causal: a correlação
        observada justifica priorização, não causalidade. Para câmeras, há ainda viés de seleção
        (instalação onde já há crime).
      </p>
    </section>
  )
}
