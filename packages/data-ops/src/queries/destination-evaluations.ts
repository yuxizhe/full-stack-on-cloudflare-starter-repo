import { eq, desc, and } from "drizzle-orm";
import {
  getDb,
  destinationEvaluations,
  type DestinationEvaluation,
  type NewDestinationEvaluation,
} from "../db/database";

/**
 * Create a new destination evaluation
 */
export async function createDestinationEvaluation(
  data: NewDestinationEvaluation
): Promise<DestinationEvaluation> {
  const db = getDb();
  const result = await db
    .insert(destinationEvaluations)
    .values(data)
    .returning();
  return result[0];
}

/**
 * Get destination evaluation by ID
 */
export async function getDestinationEvaluationById(
  id: string
): Promise<DestinationEvaluation | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(destinationEvaluations)
    .where(eq(destinationEvaluations.id, id))
    .limit(1);
  return result[0];
}

/**
 * Get all evaluations for a link
 */
export async function getEvaluationsByLink(
  linkId: string
): Promise<DestinationEvaluation[]> {
  const db = getDb();
  return await db
    .select()
    .from(destinationEvaluations)
    .where(eq(destinationEvaluations.linkId, linkId))
    .orderBy(desc(destinationEvaluations.createdAt));
}

/**
 * Get evaluations by account
 */
export async function getEvaluationsByAccount(
  accountId: string,
  limit = 100
): Promise<DestinationEvaluation[]> {
  const db = getDb();
  return await db
    .select()
    .from(destinationEvaluations)
    .where(eq(destinationEvaluations.accountId, accountId))
    .orderBy(desc(destinationEvaluations.createdAt))
    .limit(limit);
}

/**
 * Get evaluation for a specific destination URL
 */
export async function getEvaluationByDestination(
  linkId: string,
  destinationUrl: string
): Promise<DestinationEvaluation | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(destinationEvaluations)
    .where(
      and(
        eq(destinationEvaluations.linkId, linkId),
        eq(destinationEvaluations.destinationUrl, destinationUrl)
      )
    )
    .limit(1);
  return result[0];
}
