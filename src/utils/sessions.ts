import { eq } from "drizzle-orm";
import { db } from "../db";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { sessionTable, userTable } from "../db/schema";

export const generateSessionToken = () => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
};

export const createSession = async (token: string, userId: string) => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId: userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  };

  // console.log(session.id);

  const result = await db.insert(sessionTable).values({
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
  });

  if (result[0].affectedRows === 0)
    return new Error("Session was not created. A database error has occurred");
  const newSession = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.id, session.id));

  return newSession[0];
};

export const validateSessionToken = async (token: string) => {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  // console.log(sessionId);
  const result = await db
    .select()
    .from(sessionTable)
    .where(eq(sessionTable.id, token));

  if (result.length === 0) return new Error("Session does not exist");

  const resultForUser = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, result[0].userId));

  if (resultForUser.length === 0) return new Error("User does not exist");

  const session = {
    ...result[0],
    expiresAt: new Date(Number(result[0].expiresAt) * 1000),
  };

  if (Date.now() >= session.expiresAt.getTime()) {
    // await db.execute("DELETE FROM user_session WHERE id = ?", session.id);
    await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
    return null;
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .update(sessionTable)
      .set({
        expiresAt: new Date(Math.floor(Number(session.expiresAt) / 1000)),
      })
      .where(eq(sessionTable.id, session.id));
  }

  return { session, user: resultForUser[0] }
};

export const invalidateSessionToken = async (sessionId: string) => {
  await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
};

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

