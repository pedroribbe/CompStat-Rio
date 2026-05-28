// Seção 4 — Ocorrências. Indicadores do período + distribuição por tipo.
import type { Ocorrencias, Periodo } from '../../../api/types'
import { ProvenanceCard } from '../ProvenanceCard'
import { SectionCard } from '../SectionCard'

const MESES_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

// Converte "2023-01" -> "jan/2023"; se vier em outro formato, devolve cru.
function formatarMesAno(ymd: string): string {
  const [ano, mes] = ymd.split('-')
  const idx = Number(mes) - 1
  if (!ano || Number.isNaN(idx) || idx < 0 || idx > 11) return ymd
  return `${MESES_PT[idx]}/${ano}`
}

export function S4Ocorrencias({
  data,
  index,
  periodo,
}: {
  data: Ocorrencias
  index: number
  periodo: Periodo
}) {
  const { indicadores: ind, distribuicao } = data
  const maxQtd = Math.max(...distribuicao.map((d) => d.qtd), 1)
  const periodoLegivel = `${formatarMesAno(periodo.de)} a ${formatarMesAno(periodo.ate)}`

  return (
    <SectionCard
      index={index}
      id="section-ocorrencias"
      title="Ocorrências no período"
      subtitle="Furto e roubo registrados na área"
    >
      <div className="temporal-callouts">
        <span className="chip chip--neutral">
          Período: {periodoLegivel} (janela do piloto)
        </span>
      </div>

      <div className="stat-strip">
        <div className="stat stat--accent">
          <span className="stat__value tnum">{ind.total.toLocaleString('pt-BR')}</span>
          <span className="stat__label">Total de ocorrências</span>
        </div>
        <div className="stat">
          <span className="stat__value tnum">{ind.roubos.toLocaleString('pt-BR')}</span>
          <span className="stat__label">Roubos</span>
        </div>
        {typeof ind.furtos === 'number' && (
          <div className="stat">
            <span className="stat__value tnum">{ind.furtos.toLocaleString('pt-BR')}</span>
            <span className="stat__label">Furtos</span>
          </div>
        )}
        <div className="stat">
          <span className="stat__value tnum">{ind.rankingEntreAreas}º</span>
          <span className="stat__label">Ranking entre áreas</span>
        </div>
      </div>

      <div className="distro">
        <span className="distro__title">Distribuição por tipo</span>
        <table className="dtable distro__table">
          <thead>
            <tr>
              <th>Tipo de crime</th>
              <th className="num">Qtd</th>
              <th>Participação</th>
            </tr>
          </thead>
          <tbody>
            {distribuicao.map((d) => (
              <tr key={d.tipo}>
                <td>
                  <span className="distro__rank" aria-hidden="true">
                    {d.rank}
                  </span>
                  {d.tipo}
                </td>
                <td className="num">{d.qtd.toLocaleString('pt-BR')}</td>
                <td>
                  <span className="distro__bar" aria-hidden="true">
                    <span className="distro__bar-fill" style={{ width: `${(d.qtd / maxQtd) * 100}%` }} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProvenanceCard provenance={data.provenance} />
    </SectionCard>
  )
}
