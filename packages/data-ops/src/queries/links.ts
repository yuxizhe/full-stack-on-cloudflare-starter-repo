import { eq, desc, and } from "drizzle-orm";
import { getDb, links, type Link, type NewLink } from "../db/database";

/**
 * Create a new link
 */
export async function createLink(data: NewLink): Promise<Link> {
  const db = getDb();
  const result = await db.insert(links).values(data).returning();
  return result[0];
}

/**
 * Get a link by ID
 */
export async function getLinkById(linkId: string): Promise<Link | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(links)
    .where(eq(links.linkId, linkId))
    .limit(1);
  return result[0];
}

/**
 * Get all links for an account
 */
export async function getLinksByAccount(
  accountId: string,
  limit = 100
): Promise<Link[]> {
  const db = getDb();
  return await db
    .select()
    .from(links)
    .where(eq(links.accountId, accountId))
    .orderBy(desc(links.created))
    .limit(limit);
}

/**
 * Update a link
 */
export async function updateLink(
  linkId: string,
  data: Partial<Omit<NewLink, "linkId">>
): Promise<Link | undefined> {
  const db = getDb();
  const result = await db
    .update(links)
    .set({ ...data, updated: new Date() })
    .where(eq(links.linkId, linkId))
    .returning();
  return result[0];
}

/**
 * Delete a link
 */
export async function deleteLink(linkId: string): Promise<void> {
  const db = getDb();
  await db.delete(links).where(eq(links.linkId, linkId));
}
