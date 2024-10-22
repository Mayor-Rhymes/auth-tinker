import { Hono } from "hono";
import { db } from "../db";
import { sessionAuth } from "../middleware/authMiddleware";
import {
  insertTicketSchema,
  ticketTable,
  updateTicketSchema,
} from "../db/schema";
import { eq, and } from "drizzle-orm";
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

tickets.post(
  "/",
  sessionAuth,
  zValidator("json", insertTicketSchema),
  async (c) => {
    const user = c.get("user");

    const { title, description } = c.req.valid("json");

    const results = await db
      .insert(ticketTable)
      .values({ authorId: user?.id!, title: title, description: description })
      .$returningId();

    if (results.length === 0)
      return c.json({ message: "An error occurred" }, 500);

    const ticket = await db
      .select()
      .from(ticketTable)
      .where(eq(ticketTable.id, results[0].id));

    return c.json({ message: "Ticket Created", result: ticket[0] });
  }
);

tickets.get("/:id", sessionAuth, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const results = await db
    .select()
    .from(ticketTable)
    .where(and(eq(ticketTable.authorId, user?.id!), eq(ticketTable.id, id)));

  if (results.length === 0)
    return c.json({ message: "You have no ticket with that id" }, 200);

  return c.json({ message: "Ticket fetched", ticket: results[0] });
});

tickets.delete("/:id", sessionAuth, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const results = await db
    .select()
    .from(ticketTable)
    .where(and(eq(ticketTable.authorId, user?.id!), eq(ticketTable.id, id)));

  if (results.length === 0)
    return c.json({ message: "You have no ticket with that id" }, 200);

  const deletionResult = await db
    .delete(ticketTable)
    .where(and(eq(ticketTable.authorId, user?.id!), eq(ticketTable.id, id)));

  console.log(deletionResult);

  return c.json(
    { message: "Ticket has been deleted", ticket: results[0] },
    200
  );
});

tickets.patch(
  "/:id",
  sessionAuth,
  zValidator("json", updateTicketSchema),
  async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    const { title, description, updated_at } = c.req.valid("json");

    const results = await db
      .select()
      .from(ticketTable)
      .where(and(eq(ticketTable.authorId, user?.id!), eq(ticketTable.id, id)));

    if (results.length === 0)
      return c.json({ message: "You have no ticket with that id" }, 200);

    const patchResult = await db
      .update(ticketTable)
      .set({ title, description, updated_at: new Date() })
      .where(and(eq(ticketTable.authorId, user?.id!), eq(ticketTable.id, id)));
    if (patchResult[0].affectedRows === 0)
      return c.json({ message: "An error occurred" }, 500);

    const updatedTicket = await db
      .select()
      .from(ticketTable)
      .where(and(eq(ticketTable.authorId, user?.id!), eq(ticketTable.id, id)));

    if (updatedTicket.length === 0)
      return c.json({ message: "You have no ticket with that id" }, 200);

    return c.json(
      { message: "Ticket has been updated", ticket: updatedTicket[0] },
      200
    );
  }
);

export default tickets;
