// Seção 10 — Painel de Coincidências + Plano de Ação.
// O painel cruza as camadas; o plano lista ações com responsável, prazo e status.
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCoincidencias } from '../../../api/reports'
import type { AcaoRow, MatchResult } from '../../../api/types'
import { useReport } from '../../../state/reportContext'
import { EditableTable } from '../EditableTable'
import type { Column } from '../EditableTable'
import { PainelCoincidencias } from '../PainelCoincidencias'
import { SectionCard } from '../SectionCard'

// Pesos da fórmula do score, espelhados de app/backend/match/score.py.
// Mantê-los aqui em sincronia com as constantes do backend (PESO_DENSIDADE,
// PESO_FATOR, PESO_DINAMICA, PESO_LACUNA_CAMERA, NOTA_MAXIMA).
const PESO_DENSIDADE = 5.0
const PESO_FATOR = 2.0
const PESO_DINAMICA = 1.5
const PESO_LACUNA_CAMERA = 1.5
const NOTA_MAXIMA = 10

// Formata o peso em pt-BR: inteiros sem decimal ("5"), decimais com vírgula ("1,5").
function pesoBR(p: number): string {
  return Number.isInteger(p) ? String(p) : p.toString().replace('.', ',')
}

const ACAO_COLUMNS: Column<AcaoRow>[] = [
  { key: 'acao', header: 'Ação', editable: true, multiline: true, width: '42%' },
  { key: 'responsavel', header: 'Responsável', editable: true, width: '20%', placeholder: 'definir' },
  { key: 'prazo', header: 'Prazo', editable: true, width: '16%', placeholder: 'definir' },
  { key: 'status', header: 'Status', editable: true, width: '16%' },
]

export function S10Coincidencias({
  fallbackMatch,
  planoAcao,
  index,
}: {
  fallbackMatch: MatchResult
  planoAcao: AcaoRow[]
  index: number
}) {
  const { areaId, patchSection } = useReport()
  const [editing, setEditing] = useState(false)
  const [acoes, setAcoes] = useState(planoAcao)

  const { data: match } = useQuery({
    queryKey: ['coincidencias', areaId],
    queryFn: () => fetchCoincidencias(areaId),
    initialData: fallbackMatch,
    staleTime: 5 * 60 * 1000,
  })

  function onCellChange(ri: number, key: keyof AcaoRow & string, value: string) {
    setAcoes((prev) => {
      const next = prev.map((r, i) => (i === ri ? { ...r, [key]: value } : r))
      patchSection('coincidencias', { planoAcao: next }, next)
      return next
    })
  }

  return (
    <SectionCard
      index={index}
      id="section-coincidencias"
      title="Coincidências de alto risco e plano de ação"
      subtitle="Onde crime, fator e dinâmica se sobrepõem — e o que fazer"
      editing={editing}
      onToggleEdit={() => setEditing((v) => !v)}
    >
      <p className="map-note">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          Como o score é calculado: <strong>densidade de crime</strong> (peso {pesoBR(PESO_DENSIDADE)})
          {' + '}<strong>fator urbano presente</strong> ({pesoBR(PESO_FATOR)})
          {' + '}<strong>dinâmica criminal</strong> ({pesoBR(PESO_DINAMICA)})
          {' + '}<strong>ausência de câmera</strong> ({pesoBR(PESO_LACUNA_CAMERA)}),
          limitado a {NOTA_MAXIMA}. Os pesos são uma escolha do produto e podem ser revistos —
          a decisão final de prioridade é sempre do gestor humano.
        </span>
      </p>

      <PainelCoincidencias match={match} />

      <div className="plano">
        <h3 className="plano__title">Plano de ação</h3>
        <EditableTable
          columns={ACAO_COLUMNS}
          rows={acoes}
          editing={editing}
          onCellChange={onCellChange}
          rowKey={(r) => r.id}
        />
      </div>
    </SectionCard>
  )
}
