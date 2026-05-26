// ProvenanceCard — o foco do produto. Transparência da IA em linguagem de negócio.
// "Como a IA chegou aqui": racional + confiança + fontes + avisos + detalhe técnico
// recolhido. NUNCA exibe SQL/JSON/prompt.
// AGORA: inicia colapsado, clique no ícone de IA (sparkles) para expandir
import { useState } from 'react'
import type { Provenance } from '../../api/types'
import { ConfidenceBadge } from './ConfidenceBadge'
import { SourceCitation } from './SourceCitation'

export function ProvenanceCard({ provenance }: { provenance: Provenance }) {
  const [expanded, setExpanded] = useState(false)
  const [showTech, setShowTech] = useState(false)
  const { rationale, confidence, sources, warnings, technicalDetail } = provenance

  return (
    <section className="prov" aria-label="Diagnóstico IA">
      <button
        type="button"
        className="prov__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Ícone de sparkles/raio para IA */}
        <svg className="icon prov__ai-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
        </svg>
        <span className="prov__toggle-label">Diagnóstico IA</span>
        <ConfidenceBadge level={confidence} />
        <svg
          className={`icon prov__chev ${expanded ? 'open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="prov__content">
          <p className="prov__rationale">{rationale}</p>

          {sources.length > 0 && (
            <div className="prov__sources">
              <span className="prov__label">Fontes</span>
              <div className="prov__sources-list">
                {sources.map((s, i) => (
                  <SourceCitation key={`${s.kind}-${s.docId ?? i}`} c={s} />
                ))}
              </div>
            </div>
          )}

          {warnings && warnings.length > 0 && (
            <div className="prov__warnings" role="note">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div>
                <span className="prov__warn-label">Atenção</span>
                <ul>
                  {warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {technicalDetail && (
            <div className="prov__tech">
              <button
                type="button"
                className="prov__tech-toggle"
                aria-expanded={showTech}
                onClick={() => setShowTech((v) => !v)}
              >
                <svg
                  className={`icon prov__chev ${showTech ? 'open' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                Ver detalhe técnico
              </button>
              {showTech && <p className="prov__tech-body">{technicalDetail}</p>}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
