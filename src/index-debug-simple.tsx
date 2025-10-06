import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('TeleMedCare V11.0 - Debug Mode')
})

app.get('/test', (c) => {
  return c.json({ message: 'Test OK', timestamp: new Date().toISOString() })
})

export default app