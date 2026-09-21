/**
 * PLACEHOLDERS. Aparecem em `npm run dev` e, no site publicado, só com
 * `?preview=reviews`. Visitante comum nunca vê.
 * Servem para ver a seção cheia enquanto as reviews reais não chegam. Não
 * copiar para REVIEWS: review inventada é proibida no Reino Unido (DMCC Act).
 *
 * Rostos: gerados no Higgsfield (nano_banana_pro), pessoas que não existem.
 * Fotos dos jobs: `placeholder-jobs/<clean|paint|fix>/`, fotos do "depois"
 * tiradas dos reports do OS. A pasta está no .gitignore e fica só nesta
 * máquina; sem ela, os cartões usam as fotos do próprio site.
 */
const FACES = import.meta.glob('./placeholder-faces/*.webp', { eager: true, import: 'default' })
const JOBS = import.meta.glob('./placeholder-jobs/*/*.{webp,jpg,jpeg,png}', { eager: true, import: 'default' })

const SITE = {
  clean: ['rep-kitchen', 'rep-bathroom', 'rep-bedroom', 'rep-living', 'svc-clean', 'svc-carpet'],
  paint: ['svc-paint', 'rep-living', 'rep-bedroom'],
  fix: ['svc-fix', 'rep-kitchen', 'rep-bathroom'],
}

/**
 * Fotos agrupadas por apartamento (`<serviço>/<apto>-<nn>`): as três fotos de
 * um cartão saem do mesmo lugar, como numa review de verdade. Sem a pasta
 * local, cada serviço vira um "apartamento" com as fotos do próprio site.
 */
function flatsFor(service) {
  const flats = new Map()
  for (const key of Object.keys(JOBS).sort()) {
    const m = key.match(new RegExp(`/${service}/([^/]+?)-\\d+\\.\\w+$`))
    if (!m) continue
    if (!flats.has(m[1])) flats.set(m[1], [])
    flats.get(m[1]).push(JOBS[key])
  }
  const list = [...flats.values()]
  return (list.length ? list : [SITE[service].map((n) => `/b2c/img/${n}.webp`)]).map((photos) => ({ photos, next: 0 }))
}

const FLATS = { clean: flatsFor('clean'), paint: flatsFor('paint'), fix: flatsFor('fix') }
const turn = { clean: 0, paint: 0, fix: 0 }

/** `n` fotos de um apartamento do serviço; o próximo cartão pega o apartamento seguinte. */
function take(service, n) {
  const flat = FLATS[service][turn[service]++ % FLATS[service].length]
  const out = []
  for (let i = 0; out.length < Math.min(n, flat.photos.length) && i < flat.photos.length; i++) {
    const url = flat.photos[flat.next++ % flat.photos.length]
    if (!out.includes(url)) out.push(url)
  }
  return out
}

/** Três fotos por cartão: um serviço só, três do mesmo apartamento; combinado, duas do primeiro e uma de cada outro. */
function photosFor(services) {
  if (services.length === 1) return take(services[0], 3)
  const [first, ...rest] = services
  const others = rest.slice(0, 2).flatMap((s) => take(s, 1))
  return [...take(first, 3 - others.length), ...others]
}

// [rosto, nome, área, quando, serviço(s), fonte, texto]
const ROWS = [
  [1, 'Hannah R.', 'SE15', '2 weeks ago', 'clean', 'fixfy', 'Booked on a Sunday night and the team was at our flat on Tuesday at 9. The oven looked newer than when we moved in. Agent signed off the check-out that afternoon.'],
  [2, 'Daniel O.', 'E3', '1 month ago', ['clean', 'paint'], 'google', 'Four years of wear on the walls. They painted the living room and hallway and cleaned the whole flat in one day. The price on the site was the price I paid.'],
  [3, 'Priya S.', 'N7', '3 weeks ago', 'clean', 'fixfy', 'The photo report is the best bit. Every room, sent before I even asked. I forwarded it straight to the agent and that was that.'],
  [4, 'Tom H.', 'SW9', '1 week ago', 'fix', 'fixfy', 'Loose door handle, two blinds, shower sealant and holes from shelves. All done inside the two hour slot. Tidy, quick and polite.'],
  [5, 'Grace L.', 'E14', '2 months ago', 'clean', 'google', 'Studio in Canary Wharf, booked in two minutes on my phone. Spotless kitchen and bathroom, windows done inside too. Full deposit back.'],
  [6, 'Jordan B.', 'E8', '3 weeks ago', 'paint', 'fixfy', 'Fresh coat of white in two bedrooms. Floors covered, proper prep, not a drip anywhere. The landlord said it looked better than before.'],
  [7, 'Margaret P.', 'W5', '1 month ago', ['clean', 'fix'], 'fixfy', 'I let two flats in Ealing and this is who I call between tenants now. One booking for the clean and the repairs, photos by the evening.'],
  [8, 'Imran K.', 'NW10', '2 weeks ago', ['paint', 'fix'], 'google', 'New tenants moving in on Monday. They filled the holes, painted the lounge and fixed the bathroom fan on Saturday. Ready on time.'],
  [9, 'Niamh C.', 'N4', '1 month ago', 'clean', 'fixfy', 'Four of us moving out of a shared house. We split the cost, booked online and the agent had nothing to deduct. Easy.'],
  [10, 'Funmi A.', 'SE22', '3 weeks ago', 'clean', 'google', 'Two years with a dog and I was worried about the carpets. Added the carpet clean and the difference was huge. Would book again.'],
  [11, 'Steve W.', 'SE13', '2 months ago', ['clean', 'paint'], 'fixfy', "Clear prices, turned up in the window they gave me, and the report meant I didn't have to drive over and check. Exactly what a landlord needs."],
  [12, 'Nusrat H.', 'E1', '1 week ago', 'clean', 'fixfy', 'Very thorough. Inside the fridge, the oven and the extractor fan, which our last cleaner never touched. Friendly team too.'],
  [13, 'Tomasz K.', 'E17', '1 month ago', 'fix', 'google', 'Booked the half day for a list of repairs before check-out. Worked through everything and even rehung a wardrobe door I forgot to list.'],
  [14, 'Emma J.', 'N1', '3 weeks ago', ['clean', 'paint'], 'fixfy', 'Clean and touch-ups in one go. The flat looked like the day we got the keys, and the report went straight to our agent.'],
  [15, 'Clive D.', 'SW2', '2 months ago', 'clean', 'google', 'Good people. On time, worked hard and left the place spotless. Paid online, no fuss.'],
  [16, 'Ethan C.', 'N8', '5 days ago', 'clean', 'fixfy', 'Booked at midnight, confirmation straight away and a message the day before. Easiest part of the whole move.'],
  [17, 'James T.', 'SW18', '2 weeks ago', 'clean', 'fixfy', 'We book our check-out cleans through Fixfy now. The photo report goes straight into the inventory file, which saves the branch a lot of back and forth.'],
  [18, 'Rajesh P.', 'NW3', '1 month ago', 'paint', 'google', "Painted a three bed between tenants. Good finish, fair price, and the materials pack meant I didn't have to buy anything."],
  [19, 'Claire F.', 'W9', '3 weeks ago', 'clean', 'fixfy', 'Years of grease behind the hob and it came out gleaming. Deposit back in full a week later.'],
  [20, 'Amara E.', 'SE8', '1 week ago', ['clean', 'fix'], 'google', "Booked the clean and a couple of repairs together. All sorted in one visit and I didn't have to take the day off."],
  [21, 'Callum R.', 'E2', '1 month ago', 'paint', 'fixfy', 'Hallway and kitchen repainted, holes filled and sanded first. In and out in a day and the walls look brand new.'],
  [22, 'Eleni K.', 'NW6', '2 weeks ago', 'clean', 'google', 'Great communication from booking to the end. Photos of every room as they finished. Five stars.'],
  [23, 'Maya T.', 'SE10', '1 month ago', 'clean', 'fixfy', 'First flat, and I had no idea what agents check. Their checklist covered all of it. Full deposit back.'],
  [24, 'Geoffrey H.', 'SW11', '2 months ago', ['clean', 'paint', 'fix'], 'fixfy', 'Repairs, a fresh coat in two rooms and the final clean, all in one booking. The flat was re-let within the week.'],
  [25, 'Jaspal S.', 'W3', '3 weeks ago', 'fix', 'google', 'Dripping tap, two doors rehung and the bath resealed. Quick, clean work and a fair price for the two hour package.'],
  [26, 'Julie M.', 'E15', '1 week ago', 'clean', 'fixfy', 'Lovely team, careful with the floors, and the bathroom looked brand new. Booking online took two minutes.'],
  [27, 'Maricel D.', 'SW4', '1 month ago', 'clean', 'fixfy', "Booked for my daughter's flat while she had exams. On time, brilliant job, and the photos came straight to us."],
  [28, 'Oliver B.', 'N16', '4 days ago', ['clean', 'paint'], 'google', 'Last-minute move-out and they had a slot the next day. Clean and touch-up painting done by 5pm. Lifesaver.'],
  [29, 'Kwame A.', 'SE1', '2 weeks ago', 'clean', 'fixfy', 'Straightforward from start to finish. Price upfront, on time, flat spotless.'],
  [30, 'Aylin Y.', 'W2', '3 weeks ago', 'clean', 'google', "My agent suggested a professional clean and I'm glad I picked Fixfy. Every room photographed and the check-out went through without a single note."],
  [31, 'Mark S.', 'E9', '1 month ago', ['fix', 'paint'], 'fixfy', "Years of picture hooks and shelf holes, all filled and painted over. You can't tell anything was ever there."],
  [32, 'Yuki T.', 'W12', '2 weeks ago', 'clean', 'fixfy', 'Clean, polite and fast. Oven, fridge and windows were perfect. Highly recommend for end of tenancy.'],
]

// Nota de cada placeholder (o dono pediu 4.x, nunca 5.0). Só aqui: numa review
// real a nota é a que o cliente deu.
const SCORES = [4.9, 4.8, 4.9, 4.7, 4.8, 4.9, 4.8, 4.6, 4.7, 4.8, 4.9, 4.7, 4.8, 4.9, 4.6, 4.8, 4.9, 4.7, 4.8, 4.7, 4.9, 4.8, 4.8, 4.9, 4.6, 4.8, 4.9, 4.8, 4.7, 4.9, 4.8, 4.7]

// Frase curta para a faixa do hero, com o trecho em destaque (o verde do site Growth).
const QUOTES = {
  1: ['The oven looked newer than when we moved in. Agent signed off the check-out that afternoon.', 'signed off the check-out'],
  2: ['Painted and cleaned the whole flat in one day. The price on the site was the price I paid.', 'in one day'],
  3: ['The photo report is the best bit. Every room, sent before I even asked.', 'Every room, sent before I even asked'],
  5: ['Booked in two minutes on my phone. Full deposit back.', 'Full deposit back'],
  6: ['Proper prep, not a drip anywhere. The landlord said it looked better than before.', 'looked better than before'],
  7: ['This is who I call between tenants now. Photos by the evening.', 'Photos by the evening'],
  9: ['Four of us moving out of a shared house. The agent had nothing to deduct.', 'The agent had nothing to deduct'],
  10: ['Two years with a dog. The carpet clean made a huge difference.', 'a huge difference'],
  17: ['The photo report goes straight into our inventory file.', 'straight into our inventory file'],
  19: ['Years of grease behind the hob, gone. Deposit back in full a week later.', 'Deposit back in full'],
  24: ['Repairs, paint and the clean in one booking. Re-let within the week.', 'in one booking'],
  28: ['Last-minute move-out and they had a slot the next day. Lifesaver.', 'a slot the next day'],
}

export const SAMPLE_REVIEWS = ROWS.map(([face, name, area, dateLabel, service, source, text]) => {
  const services = [].concat(service)
  return {
    id: `p${face}`,
    name,
    area,
    dateLabel,
    rating: SCORES[face - 1],
    service: services,
    source,
    text,
    avatar: FACES[`./placeholder-faces/f${String(face).padStart(2, '0')}.webp`],
    photos: photosFor(services),
    quote: QUOTES[face]?.[0],
    hl: QUOTES[face]?.[1],
  }
})
