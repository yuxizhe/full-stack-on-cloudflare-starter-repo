import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Links table - stores URL shortening links and their configurations
 */
export const links = sqliteTable("links", {
  linkId: text("link_id").primaryKey().notNull(),
  accountId: text("account_id").notNull(),
  destinations: text("destinations").notNull(), // JSON string of destination URLs
  created: integer("created", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated: integer("updated", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  name: text("name").notNull(),
});

/**
 * Destination evaluations table - stores AI-powered evaluation results for destination URLs
 */
export const destinationEvaluations = sqliteTable("destination_evaluations", {
  id: text("id").primaryKey(),
  linkId: text("link_id").notNull(),
  accountId: text("account_id").notNull(),
  destinationUrl: text("destination_url").notNull(),
  status: text("status").notNull(), // e.g., "safe", "suspicious", "malicious"
  reason: text("reason").notNull(), // Explanation from AI evaluation
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

/**
 * Link clicks table - stores analytics data for link clicks with geolocation
 */
export const linkClicks = sqliteTable("link_clicks", {
  id: text("id").notNull(),
  accountId: text("account_id").notNull(),
  country: text("country"),
  destination: text("destination").notNull(),
  clickedTime: integer("clicked_time", { mode: "timestamp" }).notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

// Export types for TypeScript
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export type DestinationEvaluation = typeof destinationEvaluations.$inferSelect;
export type NewDestinationEvaluation = typeof destinationEvaluations.$inferInsert;

export type LinkClick = typeof linkClicks.$inferSelect;
export type NewLinkClick = typeof linkClicks.$inferInsert;
