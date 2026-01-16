import { eq, desc, and, gte, count, sql } from "drizzle-orm";
import {
  getDb,
  linkClicks,
  type LinkClick,
  type NewLinkClick,
} from "../db/database";

/**
 * Record a new link click
 */
export async function recordLinkClick(data: NewLinkClick): Promise<void> {
  const db = getDb();
  await db.insert(linkClicks).values(data);
}

/**
 * Get clicks for a specific link
 */
export async function getClicksByLink(
  linkId: string,
  limit = 100
): Promise<LinkClick[]> {
  const db = getDb();
  return await db
    .select()
    .from(linkClicks)
    .where(eq(linkClicks.id, linkId))
    .orderBy(desc(linkClicks.clickedTime))
    .limit(limit);
}

/**
 * Get clicks by account
 */
export async function getClicksByAccount(
  accountId: string,
  limit = 100
): Promise<LinkClick[]> {
  const db = getDb();
  return await db
    .select()
    .from(linkClicks)
    .where(eq(linkClicks.accountId, accountId))
    .orderBy(desc(linkClicks.clickedTime))
    .limit(limit);
}

/**
 * Get click count for a link
 */
export async function getClickCount(linkId: string): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ count: count() })
    .from(linkClicks)
    .where(eq(linkClicks.id, linkId));
  return result[0]?.count ?? 0;
}

/**
 * Get click count by country for a link
 */
export async function getClicksByCountry(
  linkId: string
): Promise<{ country: string | null; count: number }[]> {
  const db = getDb();
  return await db
    .select({
      country: linkClicks.country,
      count: count(),
    })
    .from(linkClicks)
    .where(eq(linkClicks.id, linkId))
    .groupBy(linkClicks.country)
    .orderBy(desc(count()));
}

/**
 * Get recent clicks within a time range
 */
export async function getRecentClicks(
  linkId: string,
  hoursAgo: number
): Promise<LinkClick[]> {
  const db = getDb();
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  const cutoffTimeStr = cutoffTime.toISOString().replace('T', ' ').split('.')[0];

  return await db
    .select()
    .from(linkClicks)
    .where(
      and(
        eq(linkClicks.id, linkId),
        gte(linkClicks.clickedTime, cutoffTimeStr)
      )
    )
    .orderBy(desc(linkClicks.clickedTime));
}
