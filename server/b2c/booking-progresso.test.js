// node --test server/b2c/booking-progresso.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { escreverFeitos, lerFeitos } from './booking.js'

test('o progresso da reserva vai e volta pelo metadata', () => {
  const feitos = { 0: 'JOB-9801', 2: 'JOB-9802' }
  assert.equal(escreverFeitos(feitos), '0:JOB-9801|2:JOB-9802')
  assert.deepEqual(lerFeitos('0:JOB-9801|2:JOB-9802'), feitos)
})

test('metadata vazio ou estranho não inventa job', () => {
  assert.deepEqual(lerFeitos(''), {})
  assert.deepEqual(lerFeitos(undefined), {})
  assert.deepEqual(lerFeitos('x:JOB-1|3:|:JOB-2'), {})
})

test('cabe no limite de 500 caracteres da Stripe', () => {
  const muitos = Object.fromEntries(Array.from({ length: 80 }, (_, i) => [i, `JOB-${10000 + i}`]))
  assert.ok(escreverFeitos(muitos).length <= 480)
})
