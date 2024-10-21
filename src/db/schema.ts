import { datetime, ForeignKey, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
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


export const insertUserSchema = createInsertSchema(userTable).omit({ id: true, created_at: true, updated_at: true });

export const selectUserSchema = createSelectSchema(userTable).omit({id: true, created_at: true, updated_at: true, username: true});



