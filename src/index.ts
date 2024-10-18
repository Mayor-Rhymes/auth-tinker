import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import users from './routes/users'
import { logger } from 'hono/logger'

const app = new Hono()


app.use(logger());
app.route("/api/auth", users);
app.get('/', (c) => {
  return c.json({message: "Hello there!"});
})


//authorized data

app.get("/authorized-data", (c) => {

    return c.json({message: "This is the authorized section. If you can access this, then you are authorized."});
})






const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
