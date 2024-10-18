import { Hono } from "hono";
import { insertUserSchema, userTable } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { sql, eq } from "drizzle-orm";
import { getCookie } from "hono/cookie"

const users = new Hono();

users.post('/signup', zValidator("json", insertUserSchema), async (c) => {
    
    const {email, username, password} = c.req.valid("json");
    

    //check if user with username or email address already exists
    const usernameExists = await db.select().from(userTable).where(eq(userTable.username, username));
    const emailExists = await db.select().from(userTable).where(eq(userTable.email, email));
    if (usernameExists.length > 0 || emailExists.length > 0) return c.json({ message: "Username or email address already exists" }, 409);


    //Retrieve the user id after creation
    const result = await db.insert(userTable).values({ email, username, password }).$returningId();
    
    //check if user creation was successful.
    if (result.length === 0) return c.json({ message: "Unable to signup" }, 400);
    
    //Get the user information if the user creation was successful.
    const finalResult = await db.select().from(userTable).where(eq(userTable.id, result[0].id));

    
    return c.json({ message: "Signup successful", user: finalResult[0]}, 200);


})





export default users;

