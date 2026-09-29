/**
 * Dia sem vaga (capacidade do OS, 29/09/2026). A vaga é por CATEGORIA de
 * serviço, a mesma do catálogo do OS: limpeza em Cleaning; reparo e pintura
 * em General Maintenance; certificado em Certificates. Um dia fica fora
 * quando alguma categoria do que está na reserva não tem vaga.
 *
 * `cap` é o que o OS devolve em /api/public/capacity: { ligado, dias }.
 * Desligado (ou sem resposta), nenhum dia fica fora: a venda segue como antes.
 */

export const CATEGORIA_DO_SERVICO = {
  clean: 'cleaning',
  fix: 'general-maintenance',
  paint: 'general-maintenance',
  cert: 'certificates',
}

export function diasSemVaga(cap, services = []) {
  const fora = new Set()
  if (!cap || cap.ligado !== true || !Array.isArray(cap.dias)) return fora
  const cats = [...new Set(services.map((s) => CATEGORIA_DO_SERVICO[s]).filter(Boolean))]
  if (!cats.length) return fora
  for (const d of cap.dias) {
    if (cats.some((c) => !(Number(d.categorias?.[c]?.vagas) > 0))) fora.add(d.data)
  }
  return fora
}
