// Geração dos 20 screenshots referenciados em docs/guia/guia_compstat_rio.tex.
// Pré-requisito: backend em :8010 e frontend em :5173 no ar.
// Cada figura é capturada num try/catch isolado: falha em uma não derruba as outras.

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIGS_DIR = path.resolve(__dirname, '..', 'figuras')
const BASE = 'http://localhost:5173'
const AREA_PV = 20 // Presidente Vargas - Campo de Santana - Central do Brasil - Cinelândia

await mkdir(FIGS_DIR, { recursive: true })

const results = []

function reg(name, ok, note = '') {
  results.push({ name, ok, note })
  const flag = ok ? '✓' : '✗'
  console.log(`${flag}  ${name}${note ? '  — ' + note : ''}`)
}

async function gotoStable(page, url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  // Pequena folga para animações terminarem.
  await page.waitForTimeout(800)
}

async function shotElement(page, selector, file) {
  const loc = page.locator(selector).first()
  await loc.waitFor({ state: 'visible', timeout: 15000 })
  await loc.scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await loc.screenshot({ path: path.join(FIGS_DIR, file) })
}

async function shotViewport(page, file, clip) {
  const opts = { path: path.join(FIGS_DIR, file), fullPage: false }
  if (clip) opts.clip = clip
  await page.screenshot(opts)
}

async function tryGenerateAi(page, sectionSelector, label) {
  // Procura, dentro da seção, um botão cujo texto contenha "Gerar" e clica.
  // Espera o conteúdo gerado (qualquer mudança no DOM) por até 60s.
  const sec = page.locator(sectionSelector).first()
  const btn = sec.getByRole('button', { name: /gerar/i }).first()
  if (await btn.count() === 0) {
    return { clicked: false, note: 'botão "Gerar" não encontrado (provavelmente já gerado)' }
  }
  await btn.click()
  // Considera "carregado" quando o próprio botão some/desabilita OU aparece texto novo.
  try {
    await Promise.race([
      btn.waitFor({ state: 'hidden', timeout: 60000 }),
      sec.locator('[data-ai-block-status="gerado"]').waitFor({ state: 'visible', timeout: 60000 }),
      sec.locator('p, blockquote').filter({ hasText: /\w{40,}/ }).first().waitFor({ state: 'visible', timeout: 60000 }),
    ])
    await page.waitForTimeout(700)
    return { clicked: true, note: `IA gerada com sucesso (${label})` }
  } catch (e) {
    return { clicked: true, note: `clicou Gerar mas não confirmou conclusão em 60s — ${e.message.slice(0, 80)}` }
  }
}

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  locale: 'pt-BR',
})
const page = await ctx.newPage()

// =============== FIGURAS ===============

// 01 — Home (lista de áreas)
try {
  await gotoStable(page, `${BASE}/`)
  await shotViewport(page, '01_home_lista_areas.png')
  reg('01_home_lista_areas.png', true)
} catch (e) { reg('01_home_lista_areas.png', false, e.message) }

// 02 — Topo com seletor de abas (recorte)
try {
  await gotoStable(page, `${BASE}/`)
  await shotViewport(page, '02_topbar_abas.png', { x: 0, y: 0, width: 1440, height: 96 })
  reg('02_topbar_abas.png', true)
} catch (e) { reg('02_topbar_abas.png', false, e.message) }

// 03 — Panorama topo (relatório de PV)
try {
  await gotoStable(page, `${BASE}/?area=${AREA_PV}`)
  await page.waitForSelector('#section-identificacao', { timeout: 15000 })
  await shotViewport(page, '03_panorama_topo.png')
  reg('03_panorama_topo.png', true)
} catch (e) { reg('03_panorama_topo.png', false, e.message) }

// 04 a 08 — Seções S1..S5 (estáticas, sem IA)
const ESTATICAS = [
  ['04_secao_s1_identificacao.png', '#section-identificacao'],
  ['05_secao_s2_mapa.png',          '#section-mapa'],
  ['06_secao_s3_resumo.png',        '#section-resumo'],
  ['07_secao_s4_ocorrencias.png',   '#section-ocorrencias'],
  ['08_secao_s5_temporal.png',      '#section-temporal'],
]
for (const [file, sel] of ESTATICAS) {
  try {
    await shotElement(page, sel, file)
    reg(file, true)
  } catch (e) { reg(file, false, e.message) }
}

// 09 — S6 (Dinâmica Criminal) — tenta gerar IA antes
try {
  const sec = '#section-dinamica'
  await page.locator(sec).first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const r = await tryGenerateAi(page, sec, 'S6 dinâmica')
  await shotElement(page, sec, '09_secao_s6_dinamica.png')
  reg('09_secao_s6_dinamica.png', true, r.note)
} catch (e) { reg('09_secao_s6_dinamica.png', false, e.message) }

// 10 — S7 (Efetivo da FM) — não tem botão Gerar inline (é uma tabela editável),
// mas vale tentar. Se não houver, screenshot direto.
try {
  const sec = '#section-efetivo'
  await page.locator(sec).first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  const r = await tryGenerateAi(page, sec, 'S7 efetivo')
  await shotElement(page, sec, '10_secao_s7_efetivo.png')
  reg('10_secao_s7_efetivo.png', true, r.note)
} catch (e) { reg('10_secao_s7_efetivo.png', false, e.message) }

// 11 a 13 — Seções S8..S10
const FINAIS = [
  ['11_secao_s8_fatores.png',       '#section-fatores'],
  ['12_secao_s9_cameras.png',       '#section-cameras'],
  ['13_secao_s10_coincidencias.png','#section-coincidencias'],
]
for (const [file, sel] of FINAIS) {
  try {
    await shotElement(page, sel, file)
    reg(file, true)
  } catch (e) { reg(file, false, e.message) }
}

// 14 — Mapa Preditivo (visão geral, "Todas as áreas")
try {
  await gotoStable(page, `${BASE}/?view=preditivo`)
  // Espera o iframe do Folium carregar.
  await page.waitForSelector('.pred-map iframe', { timeout: 15000 })
  await page.waitForTimeout(2000) // tiles do Folium
  await shotViewport(page, '14_mapa_preditivo_geral.png')
  reg('14_mapa_preditivo_geral.png', true)
} catch (e) { reg('14_mapa_preditivo_geral.png', false, e.message) }

// 15 — Mapa Preditivo, área = Presidente Vargas
try {
  // Pega o nome exato da opção que contém "Presidente Vargas"
  const select = page.locator('#pred-map-select')
  const opts = await select.locator('option').allTextContents()
  const pv = opts.find((t) => /Presidente Vargas/i.test(t))
  if (!pv) throw new Error('opção Presidente Vargas não encontrada no <select>')
  await select.selectOption({ label: pv })
  await page.waitForTimeout(2500)
  await shotViewport(page, '15_mapa_preditivo_area_PV.png')
  reg('15_mapa_preditivo_area_PV.png', true, `área: ${pv}`)
} catch (e) { reg('15_mapa_preditivo_area_PV.png', false, e.message) }

// 16 — Aba Drivers ativa (já é o padrão)
try {
  // Volta para "Todas as áreas". selectOption aceita label STRING (não regex);
  // descobrimos o label dinamicamente.
  const opts2 = await page.locator('#pred-map-select option').allTextContents()
  const todas = opts2.find((t) => /Todas/i.test(t))
  if (!todas) throw new Error('opção "Todas as áreas" não encontrada')
  await page.selectOption('#pred-map-select', { label: todas })
  await page.waitForTimeout(1500)
  const driversBtn = page.locator('.pred-tab', { hasText: /^Drivers$/ }).first()
  await driversBtn.click()
  await page.waitForTimeout(800)
  await shotElement(page, '.pred-sidebar', '16_drivers_tab.png')
  reg('16_drivers_tab.png', true)
} catch (e) { reg('16_drivers_tab.png', false, e.message) }

// 17 — Aba Métricas
try {
  await page.locator('.pred-tab', { hasText: /^Métricas$/ }).first().click()
  await page.waitForTimeout(800)
  await shotElement(page, '.pred-sidebar', '17_metricas_tab.png')
  reg('17_metricas_tab.png', true)
} catch (e) { reg('17_metricas_tab.png', false, e.message) }

// 18 — Aba Coeficientes
try {
  await page.locator('.pred-tab', { hasText: /^Coeficientes$/ }).first().click()
  await page.waitForTimeout(800)
  await shotElement(page, '.pred-sidebar', '18_coeficientes_tab.png')
  reg('18_coeficientes_tab.png', true)
} catch (e) { reg('18_coeficientes_tab.png', false, e.message) }

// 19 — Painel de Alavancas (bloco abaixo do mapa+sidebar; só aparece na aba Drivers)
try {
  await page.locator('.pred-tab', { hasText: /^Drivers$/ }).first().click()
  await page.waitForTimeout(800)
  await page.locator('.pred-actionable').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(400)
  await shotElement(page, '.pred-below', '19_painel_alavancas.png')
  reg('19_painel_alavancas.png', true)
} catch (e) { reg('19_painel_alavancas.png', false, e.message) }

// 20 — Popup de hexágono no mapa preditivo
// Estratégia: rola para o topo, foca o iframe do Folium, clica no centro do mapa
// (onde costuma haver hexes), e tira screenshot do viewport com o popup aberto.
try {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(500)
  const frame = page.frameLocator('.pred-map iframe').first()
  // Clica perto do centro do mapa. As coordenadas são relativas à página,
  // não ao iframe — então usamos o boundingBox do iframe para calcular.
  const iframeEl = page.locator('.pred-map iframe').first()
  const box = await iframeEl.boundingBox()
  if (!box) throw new Error('iframe sem boundingBox')
  // Clica no centro do mapa
  const cx = box.x + box.width / 2
  const cy = box.y + box.height / 2
  await page.mouse.click(cx, cy)
  await page.waitForTimeout(1500)
  // Verifica se há popup visível
  const popupVisible = await frame.locator('.leaflet-popup').count() > 0
  await shotViewport(page, '20_popup_hex.png')
  reg('20_popup_hex.png', true, popupVisible ? 'popup aberto' : 'popup não detectado; screenshot mesmo assim')
} catch (e) { reg('20_popup_hex.png', false, e.message) }

await browser.close()

// =============== RELATÓRIO FINAL ===============
console.log('\n===== RESUMO =====')
let ok = 0, fail = 0
for (const r of results) {
  if (r.ok) ok++
  else fail++
}
console.log(`Total: ${results.length}  |  OK: ${ok}  |  Falhas: ${fail}`)

// Lista arquivos efetivamente criados em FIGS_DIR (com tamanho)
console.log('\n===== ARQUIVOS GERADOS =====')
const created = []
for (const r of results) {
  const fp = path.join(FIGS_DIR, r.name)
  if (existsSync(fp)) {
    const sz = statSync(fp).size
    created.push({ name: r.name, size: sz })
    console.log(`  ${(sz / 1024).toFixed(1).padStart(7)} KB  ${r.name}`)
  } else {
    console.log(`  (faltando)  ${r.name}`)
  }
}

if (fail > 0) {
  console.log('\n===== FALHAS =====')
  for (const r of results) if (!r.ok) console.log(`  ${r.name}  —  ${r.note}`)
}
