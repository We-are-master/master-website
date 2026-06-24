import { listAvailableSlots } from './google-calendar.js'

export async function handleAvailability() {
  try {
    const result = await listAvailableSlots(5)
    return { status: 200, data: result }
  } catch (err) {
    console.error('[growth-api] availability:', err)
    return { status: 500, data: { error: 'Failed to load availability' } }
  }
}
