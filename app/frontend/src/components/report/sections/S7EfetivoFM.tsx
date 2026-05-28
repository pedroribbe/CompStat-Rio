// Seção 7 — Efetivo da FM. Tabela editável: campo / situação atual /
// sugestão (IA) / justificativa, com proveniência por linha.
import { useState } from 'react'
import type { EfetivoRow } from '../../../api/types'
import { useReport } from '../../../state/reportContext'
import { EditableTable } from '../EditableTable'
import type { Column } from '../EditableTable'
import { SectionCard } from '../SectionCard'

const COLUMNS: Column<EfetivoRow>[] = [
  { key: 'campo', header: 'Campo', width: '20%' },
  { key: 'situacaoAtual', header: 'Situação atual', editable: true, multiline: true, width: '26%', placeholder: 'não informado' },
  { key: 'sugestao', header: 'Sugestão (IA)', editable: true, multiline: true, width: '28%' },
  { key: 'justificativa', header: 'Justificativa', editable: true, multiline: true, placeholder: '—' },
]

export function S7EfetivoFM({ rows, index }: { rows: EfetivoRow[]; index: number }) {
  const { patchSection } = useReport()
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState(rows)

  function onCellChange(ri: number, key: keyof EfetivoRow & string, value: string) {
    setLocal((prev) => {
      const next = prev.map((r, i) => (i === ri ? { ...r, [key]: value } : r))
      patchSection('efetivo', { efetivoFM: next }, next)
      return next
    })
  }

  return (
    <SectionCard
      index={index}
      id="section-efetivo"
      title="Emprego do efetivo (FM)"
      subtitle="Sugestões de cobertura, horário e modelo de emprego"
      editing={editing}
      onToggleEdit={() => setEditing((v) => !v)}
    >
      <EditableTable
        columns={COLUMNS}
        rows={local}
        editing={editing}
        onCellChange={onCellChange}
        rowKey={(r) => r.blockId}
      />
      <p className="map-note">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          Como esta sugestão é gerada: é uma recomendação da IA construída a partir de dois insumos —{' '}
          <strong>pico temporal</strong> (dia e horário de maior incidência) e{' '}
          <strong>deslocamento do autor</strong> (indício extraído de RELINT e Disque Denúncia, tratado como inteligência, não como fato).
          Esta sugestão <strong>não usa o score de prioridade</strong>. A decisão final é sempre do gestor humano.
        </span>
      </p>
      <p className="map-note">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        Sugestões respeitam o teto de 600 agentes para todas as áreas. Dimensionamento final é decisão do comando da FM.
      </p>
    </SectionCard>
  )
}
