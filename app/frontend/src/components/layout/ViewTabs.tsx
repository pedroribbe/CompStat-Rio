// Segmented control de navegação primária: alterna entre as duas visões
// (Panorama Operacional e Mapa Preditivo). A aba ativa é destacada visualmente
// e marcada com aria-selected para leitores de tela. Não controla URL: chama
// os callbacks recebidos por prop, que devem fazer pushPredictive/clearView
// e atualizar o estado da app (padrão já usado em App.tsx).
export type AppView = 'home' | 'preditivo'

export function ViewTabs({
  view,
  onOpenHome,
  onOpenPredictive,
}: {
  view: AppView
  onOpenHome: () => void
  onOpenPredictive: () => void
}) {
  return (
    <nav className="view-tabs" role="tablist" aria-label="Visões">
      <button
        type="button"
        role="tab"
        aria-selected={view === 'home'}
        className={`view-tabs__btn ${view === 'home' ? 'view-tabs__btn--active' : ''}`}
        onClick={onOpenHome}
      >
        Panorama Operacional
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'preditivo'}
        className={`view-tabs__btn ${view === 'preditivo' ? 'view-tabs__btn--active' : ''}`}
        onClick={onOpenPredictive}
      >
        Mapa Preditivo
      </button>
    </nav>
  )
}
