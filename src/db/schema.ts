import { datetime, ForeignKey, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { generateSessionToken } from "../utils/sessions";

export const userTable = mysqlTable("userTable", {
    id: varchar('id', {length: 255}).notNull().$defaultFn(() => createId()).unique().primaryKey(),
    email: text('email').notNull().unique(),
    username: varchar('username', {length: 128}).notNull().unique(),
    password: text('password').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
})


export const sessionTable = mysqlTable("sessionTable", {
    id: varchar('id', { length: 255 }).notNull().primaryKey(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => userTable.id),
    expiresAt: datetime("expires_at").notNull(),
    
})


export const ticketTable = mysqlTable("ticketTable", {
    id: varchar('id', { length: 255}).notNull().$defaultFn(() => createId()).unique().primaryKey(),
    authorId: varchar("author_id", {length: 255}).notNull().references(() => userTable.id),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: mysqlEnum(['open', 'closed', 'pending']).$default(() => "open"),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
})


export const insertUserSchema = createInsertSchema(userTable).omit({ id: true, created_at: true, updated_at: true });

export const selectUserSchema = createSelectSchema(userTable).omit({id: true, created_at: true, updated_at: true, username: true});


export const insertTicketSchema = createInsertSchema(ticketTable).omit({id: true, created_at: true, updated_at: true, authorId: true, status: true});
