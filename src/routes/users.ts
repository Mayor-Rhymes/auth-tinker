import { Hono } from "hono";
import { insertUserSchema, selectUserSchema, userTable } from "../db/schema";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { or, eq } from "drizzle-orm";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import {
  createSession,
  generateSessionToken,
  invalidateSessionToken,
} from "../utils/sessions";
import { hash, verify } from "@node-rs/argon2";

const users = new Hono();

users.post("/signup", zValidator("json", insertUserSchema), async (c) => {
  const { email, username, password } = c.req.valid("json");

  //check if user with username or email address already exists
  const usernameExists = await db
    .select()
    .from(userTable)
    .where(eq(userTable.username, username));
  const emailExists = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));
  if (usernameExists.length > 0 || emailExists.length > 0)
    return c.json({ message: "Username or email address already exists" }, 409);

  //encrypt password
  const hashedPassword = await hash(password);

  //Retrieve the user id after creation
  const result = await db
    .insert(userTable)
    .values({ email, username, password: hashedPassword })
    .$returningId();
  console.log(result);
  //check if user creation was successful.
  if (result.length === 0) return c.json({ message: "Unable to signup" }, 400);

  //Get the user information if the user creation was successful.
  const finalResult = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, result[0].id));

  const token = generateSessionToken();
  const session = await createSession(token, finalResult[0].id);
  setCookie(c, "session", token);

  return c.json(
    { message: "Signup successful", user: finalResult[0], session },
    200
  );
});

users.post("/login", zValidator("json", selectUserSchema), async (c) => {
  const { username, email, password } = c.req.valid("json");

  const result = await db
    .select()
    .from(userTable)
    .where(or(eq(userTable.email, email!), eq(userTable.username, username!)));

  if (result.length === 0)
    return c.json({ message: "This user does not exist" });

  //If user with that email exists, check to see if the password inputted is correct.

  const passwordCorrect = await verify(result[0].password, password);

  if (!passwordCorrect) return c.json({ message: "Incorrect password" });

  const token = generateSessionToken();
  const session = await createSession(token, result[0].id);
  setCookie(c, "session", token);

  return c.json({ message: "Login successful", user: result[0], session }, 200);
});

users.post("/logout", async (c) => {
  const token = getCookie(c, "session");
  if (token !== null) {
    invalidateSessionToken(token as string);
  }

  deleteCookie(c, "session");
  return c.json({ message: "Logout successful" });
});

export default users;
