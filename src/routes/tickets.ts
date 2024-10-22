import { Hono } from "hono";
import { db } from "../db";
import { sessionAuth } from "../middleware/authMiddleware";
import { insertTicketSchema, ticketTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";


const tickets = new Hono();

tickets.get("/", sessionAuth, async (c) => {
  const user = c.get("user");

  const results = await db
    .select()
    .from(ticketTable)
    .where(eq(ticketTable.authorId, user?.id!));

  if (results.length === 0)
    return c.json({ message: "You have no tickets" }, 200);

  return c.json({ message: "Tickets fetched", results });
});


tickets.post("/", sessionAuth, zValidator("json", insertTicketSchema), async (c) => {
    
    const user = c.get("user");

    const { title, description} = c.req.valid("json");

    const results = await db.insert(ticketTable).values({authorId: user?.id!, title: title, description: description}).$returningId();
    
    if(results.length === 0) return c.json({message: "An error occurred"}, 500);
    
    const ticket = await db.select().from(ticketTable).where(eq(ticketTable.id, results[0].id));

    
    return c.json({message: "Ticket Created", result: ticket[0]});
})



export default tickets;
