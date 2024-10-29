import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import users from './routes/users'
import tickets from './routes/tickets'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
const app = new Hono()


app.use(logger());
app.use("/api/*", cors({
  origin: "http://localhost:5173",
  allowMethods: ["GET", "PUT", "POST", "DELETE", "PATCH", "HEAD"],
  credentials: true,
}));

app.route("/api/auth", users);
app.route("/api/tickets", tickets);
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
