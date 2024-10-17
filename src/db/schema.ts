import { mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";
import { createInsertSchema } from "drizzle-zod";

export const userTable = mysqlTable("userTable", {
    id: varchar('id', {length: 255}).notNull().$defaultFn(() => createId()).unique().primaryKey(),
    email: text('email').notNull().unique(),
    username: varchar('username', {length: 128}).notNull().unique(),
    password: text('password').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow(),
    updated_at: timestamp('updated_at').notNull().defaultNow(),
})


const insertUserSchema = createInsertSchema(userTable);


