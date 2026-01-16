import { sqliteTable, text, numeric, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Links table - stores URL shortening links and their configurations
 * Schema pulled from D1 database: claude-test
 */
export const links = sqliteTable("links", {
  linkId: text("link_id").primaryKey().notNull(),
  accountId: text("account_id").notNull(),
  destinations: text("destinations").notNull(), // JSON string of destination URLs
  created: numeric("created")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated: numeric("updated")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  name: text("name").notNull(),
});

/**
 * Destination evaluations table - stores AI-powered evaluation results for destination URLs
 * Schema pulled from D1 database: claude-test
 */
export const destinationEvaluations = sqliteTable(
  "destination_evaluations",
  {
    id: text("id").primaryKey(),
    linkId: text("link_id").notNull(),
    accountId: text("account_id").notNull(),
    destinationUrl: text("destination_url").notNull(),
    status: text("status").notNull(), // e.g., "safe", "suspicious", "malicious"
    reason: text("reason").notNull(), // Explanation from AI evaluation
    createdAt: numeric("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    accountTimeIdx: index("idx_destination_evaluations_account_time").on(
      table.accountId,
      table.createdAt
    ),
  })
);

/**
 * Link clicks table - stores analytics data for link clicks with geolocation
 * Schema pulled from D1 database: claude-test
 */
export const linkClicks = sqliteTable(
  "link_clicks",
  {
    id: text("id").notNull(),
    accountId: text("account_id").notNull(),
    country: text("country"),
    destination: text("destination").notNull(),
    clickedTime: numeric("clicked_time").notNull(),
    latitude: real("latitude"),
    longitude: real("longitude"),
  },
  (table) => ({
    idIdx: index("idx_link_clicks_id").on(table.id),
    accountIdIdx: index("idx_link_clicks_account_id").on(table.accountId),
    clickedTimeIdx: index("idx_link_clicks_clicked_time").on(table.clickedTime),
  })
);

// Export types for TypeScript
export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export type DestinationEvaluation = typeof destinationEvaluations.$inferSelect;
export type NewDestinationEvaluation = typeof destinationEvaluations.$inferInsert;

export type LinkClick = typeof linkClicks.$inferSelect;
export type NewLinkClick = typeof linkClicks.$inferInsert;
