/**
 * Conteúdo editorial do B2C: o padrão de limpeza por cômodo, as perguntas
 * frequentes e as reviews. Inglês britânico, sem travessão.
 */
import { COMPANY, PROMISES, TERMS } from './site.js'
import { PAINT, cleanPrice, formatGBP } from './pricing.js'

const RECLEAN = PROMISES.recleanDays.value
const CANCEL = PROMISES.freeCancellationHours
/** Quanto o deep clean sai abaixo do end of tenancy no mesmo imóvel de 2 quartos. */
const DEEP_SAVING = cleanPrice('2', 'eot') - cleanPrice('2', 'deep')

/** "Check-out ready": o que o profissional faz, cômodo a cômodo (o checklist da Fixfy). */
export const CHECKLIST = [
  {
    id: 'kitchen',
    room: 'Kitchen',
    items: [
      'Oven deep cleaned: inside, racks, trays and door glass',
      'Hob, extractor hood and filters degreased',
      'Cupboards and drawers cleaned inside and out',
      'Worktops, splashback and tiles degreased',
      'Sink and taps descaled and polished',
      'Microwave, dishwasher and washing machine drawer cleaned',
      'Bins emptied and washed',
      'Floor hoovered and mopped, edges included',
    ],
    addOns: ['Fridge freezer'],
  },
  {
    id: 'bathroom',
    room: 'Bathroom',
    items: [
      'Limescale off taps, shower head, screen and tiles',
      'Bath, shower tray and basin cleaned and polished',
      'Toilet cleaned inside and out, base and back included',
      'Grout scrubbed and mould spots treated',
      'Mirrors and chrome polished streak-free',
      'Extractor fan cover and cabinets wiped',
      'Floor and skirting mopped',
    ],
    addOns: [],
  },
  {
    id: 'rooms',
    room: 'Bedrooms and living',
    items: [
      'Skirting boards, doors and frames wiped',
      'Switches, sockets and handles cleaned',
      'Windows inside, frames and sills',
      'Wardrobes and built-ins inside and out',
      'Radiators dusted and wiped',
      'Light fittings dusted where reachable',
      'Floors hoovered and mopped',
    ],
    addOns: ['Carpet steam clean'],
  },
  {
    id: 'throughout',
    room: 'Throughout',
    items: [
      'Cobwebs cleared from ceilings and corners',
      'Blinds dusted',
      'Marks spot-cleaned from walls where they come off',
      'Hallway, stairs and landing done',
      'A photo of every room when the job is done',
    ],
    addOns: ['Windows outside', 'Balcony or patio'],
  },
]

/**
 * O que o cliente deixa pronto antes da visita do profissional, por serviço.
 * Aparece na página de confirmação e no e-mail "Booking received"
 * (server/b2c/confirmation-email.js).
 */
export const BEFORE_WE_ARRIVE = {
  clean: ['Empty the place as much as you can, including cupboards and the fridge', 'Leave the electricity and hot water on', 'Take the rubbish out or tell us to add a collection'],
  // Deep clean é casa ocupada: nada de esvaziar o imóvel.
  deep: ['Clear the worktops and surfaces you want cleaned', 'Empty any cupboards or wardrobes you want cleaned inside', 'Put away anything fragile or valuable'],
  paint: ['Tell us if the landlord left matching paint', 'Move furniture off the walls that need work'],
  fix: ['Leave any parts you already bought where your handyman can see them', 'Say in a message if something needs a specific finish'],
  cert: ['Keep the gas and electricity on', 'Clear the way to the boiler, the fuse box and every gas appliance'],
}

/** Itens do "Before your professional arrives" para os serviços da reserva, sem repetir. */
export function beforeWeArrive(services = [], cleanKindId = null) {
  const keys = services.map((s) => (s === 'clean' && cleanKindId === 'deep' ? 'deep' : s))
  return [...new Set(keys.flatMap((k) => BEFORE_WE_ARRIVE[k] || []))]
}

// Ordem do dia quando há mais de um serviço (a mesma do scope no OS).
const WORK_ORDER = [
  ['cert', 'certificates'],
  ['fix', 'repairs'],
  ['paint', 'paint'],
  ['clean', 'the clean'],
]

/** "Repairs first, then paint, then the clean. " ou '' com um serviço só. */
export function workOrderLine(services = []) {
  const steps = WORK_ORDER.filter(([id]) => services.includes(id)).map(([, label]) => label)
  if (steps.length < 2) return ''
  const [first, ...rest] = steps
  return `${first[0].toUpperCase()}${first.slice(1)} first, then ${rest.join(', then ')}. `
}

export const FAQS = [
  {
    q: 'How do I pay?',
    a: `By card when you book, through Stripe's secure checkout. ${COMPANY.legalName} (Fixfy) receives your payment as agent for the professional who does your job, so paying Fixfy counts as paying them. You get a receipt in their name with your booking confirmation, and the photo report when the job is done. Changes and cancellations are free up to ${CANCEL} hours before your slot, refunded in full.`,
  },
  {
    q: 'Who does the work?',
    a: 'An independent, vetted professional who works through Fixfy. Your contract for the job is with them: Fixfy arranges the booking as their agent and receives your payment on their behalf. We name them in your booking confirmation, before the visit, and stay your contact for anything you need.',
  },
  {
    q: 'What is in the photo report?',
    a: 'Photos of every room your professional worked on, taken when they finish, with the time they were taken. It is yours to keep and to forward to your agent or landlord before check-out.',
  },
  {
    q: 'Can you guarantee I get my deposit back?',
    a: `Nobody honestly can: deposit decisions sit with your landlord, your agent and the deposit scheme. What we can promise is a clean done to the Fixfy room-by-room checklist, a photo report as proof, and a free return visit if your agent or landlord flags something on that checklist within ${RECLEAN} days.`,
  },
  {
    q: 'How does the free re-clean work?',
    a: `If your agent or landlord flags anything on our checklist within ${RECLEAN} days of the clean, send us their note or a photo and we arrange for your cleaner to come back and put it right at no cost. The property needs to be empty and unchanged since the clean.`,
  },
  {
    q: 'Can I book painting and repairs with the clean?',
    a: 'Yes, that is the point of one booking. Add them in the same checkout and we plan the order for you: repairs and paint first, the clean last, so you hand back a property with no dust and no touch-up marks.',
  },
  {
    q: 'Does the property need to be empty?',
    a: 'It works best empty, with the electricity and hot water still on. If you are still moving out on the day, tell us in the booking notes and we will plan around you.',
  },
  {
    q: 'How does my professional get in?',
    a: 'You can be there, leave keys with your agent or concierge, or give us a key safe code, which we pass only to your professional. You choose in the booking, and we confirm the plan with you the day before.',
  },
  {
    q: 'How long does it take?',
    a: 'A 2 bedroom flat usually takes a team 4 to 6 hours. Painting and repairs are booked by time, so you know how long your professional will be there before they arrive.',
  },
  {
    q: 'What about paint and materials?',
    a: `For painting, add the paint and materials pack for ${formatGBP(PAINT.materials.price)}, supplied by your painter: paint in white or magnolia, filler, sandpaper, tape and dust sheets. Or leave the landlord’s paint on site for them to use. Parts for repairs, and anything outside the pack, are only bought with your approval, at the price agreed with you, and listed in your photo report.`,
  },
  {
    q: 'Can I change or cancel?',
    a: `Yes. Changes and cancellations are free up to ${CANCEL} hours before your slot, with a full refund. Closer than that, a cancellation charge of ${TERMS.lateCancellationPercent}% of the price is due to your professional for the time they kept for you. It all goes to them: Fixfy collects it on their behalf and keeps none of it. If you booked in the last 14 days and the work has not started, the refund is still in full. The booking terms have the detail.`,
  },
  {
    q: 'Who issues the gas and electrical certificate?',
    a: 'A registered engineer: Gas Safe for the gas safety record, NICEIC or NAPIT for the electrical report. The certificate is issued in their own name and registration number, and comes to you the same day with the photo report. Fixfy books the engineer and keeps the expiry date on file.',
  },
  {
    q: 'What if something fails the safety check?',
    a: 'You get the report with what failed and why, plus a fixed price to put it right. Nothing is done until you say yes, and you are free to use someone else.',
  },
  {
    q: 'Which areas do you cover?',
    a: 'All of London: every London postcode, from the centre to the outer boroughs, Monday to Saturday.',
  },
]

/**
 * Perguntas só do deep clean (casa ocupada, 21/09/2026). A página dele usa
 * estas e as gerais do FAQS; o deposit e o re-clean ficam fora, são do end of
 * tenancy (o re-clean depende do agente e do imóvel vazio).
 */
export const DEEP_FAQS = [
  {
    q: 'How is a deep clean different from an end of tenancy clean?',
    a: `A deep clean is for the home you live in, so your cleaner works around your furniture and belongings, and it costs around £${DEEP_SAVING} less on a two bedroom. An end of tenancy clean is for an empty property on check-out day. The oven is included in both, and the add-ons are the same.`,
  },
  {
    q: 'Do I need to empty the place?',
    a: 'No. Clear the worktops and surfaces you want cleaned, and empty any cupboards or wardrobes you want done inside. Your cleaner works around everything else.',
  },
]

/**
 * Reviews: SÓ de cliente de verdade, com fonte e data. Desde abril de 2025
 * o DMCC Act proíbe publicar ou encomendar review falso (multa de até 10% do
 * faturamento global). A lista começa vazia e cresce com o agente de review
 * do plano (pede a todo cliente direto depois do relatório aprovado).
 *
 * Formato:
 * { id, name: 'Priya S.', area: 'SE15', date: '2026-10-02', rating: 5 (a nota que o cliente deu; decimal só se vier de média por quesito),
 *   service: 'clean' | 'paint' | 'fix', source: 'google' | 'trustpilot' | 'fixfy',
 *   text: '...', photos: ['/b2c/reviews/xxx.webp'], url: 'link público da review',
 *   quote: 'frase curta da própria review, para a faixa do hero (opcional)',
 *   hl: 'trecho do quote que fica em verde (opcional)' }
 */
export const REVIEWS = []

/** Perfis públicos de review. Só aparece o que tiver url e nota de verdade. */
export const REVIEW_SOURCES = [
  { id: 'google', label: 'Google', url: null, rating: null, count: null },
  { id: 'trustpilot', label: 'Trustpilot', url: null, rating: null, count: null },
]
