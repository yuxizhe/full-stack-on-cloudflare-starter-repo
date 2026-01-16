import { t } from "@/worker/trpc/trpc-instance";
import { z } from "zod";
import {
  createLinkSchema,
  destinationsSchema,
} from "@repo/data-ops/zod-schema/links";
import {
  createLink,
  getLinkById,
  getLinksByAccount,
  updateLink,
  deleteLink,
} from "@repo/data-ops/queries/links";
import {
  getClicksByAccount,
  getClickCount,
  getClicksByCountry,
  getRecentClicks,
} from "@repo/data-ops/queries/link-clicks";

import { TRPCError } from "@trpc/server";

/**
 * Generate a random short link ID
 */
function generateLinkId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const linksTrpcRoutes = t.router({
  /**
   * Get list of links for the current user
   */
  linkList: t.procedure
    .input(
      z.object({
        offset: z.number().optional(),
        limit: z.number().optional().default(25),
      })
    )
    .query(async ({ ctx, input }) => {
      const accountId = ctx.userInfo.userId;
      const links = await getLinksByAccount(accountId, input.limit);

      // Parse destinations JSON string to object
      return links.map((link) => ({
        ...link,
        destinations:
          typeof link.destinations === "string"
            ? JSON.parse(link.destinations)
            : link.destinations,
      }));
    }),

  /**
   * Create a new link
   */
  createLink: t.procedure.input(createLinkSchema).mutation(async ({ ctx, input }) => {
    const accountId = ctx.userInfo.userId;
    const linkId = generateLinkId();
    const now = new Date().toISOString().replace("T", " ").split(".")[0];

    const newLink = await createLink({
      linkId,
      accountId,
      name: input.name,
      destinations: JSON.stringify(input.destinations),
      created: now,
      updated: now,
    });

    return newLink.linkId;
  }),

  /**
   * Update link name
   */
  updateLinkName: t.procedure
    .input(
      z.object({
        linkId: z.string(),
        name: z.string().min(1).max(300),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const accountId = ctx.userInfo.userId;

      // Verify ownership
      const link = await getLinkById(input.linkId);
      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }
      if (link.accountId !== accountId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await updateLink(input.linkId, { name: input.name });
      return { success: true };
    }),

  /**
   * Get a single link by ID
   */
  getLink: t.procedure
    .input(
      z.object({
        linkId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const accountId = ctx.userInfo.userId;
      const link = await getLinkById(input.linkId);

      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }
      if (link.accountId !== accountId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      return {
        ...link,
        destinations:
          typeof link.destinations === "string"
            ? JSON.parse(link.destinations)
            : link.destinations,
      };
    }),

  /**
   * Update link destinations
   */
  updateLinkDestinations: t.procedure
    .input(
      z.object({
        linkId: z.string(),
        destinations: destinationsSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      const accountId = ctx.userInfo.userId;

      // Verify ownership
      const link = await getLinkById(input.linkId);
      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }
      if (link.accountId !== accountId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await updateLink(input.linkId, {
        destinations: JSON.stringify(input.destinations),
      });
      return { success: true };
    }),

  /**
   * Delete a link
   */
  deleteLink: t.procedure
    .input(
      z.object({
        linkId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const accountId = ctx.userInfo.userId;

      // Verify ownership
      const link = await getLinkById(input.linkId);
      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }
      if (link.accountId !== accountId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
      }

      await deleteLink(input.linkId);
      return { success: true };
    }),

  /**
   * Get active links in last hour
   */
  activeLinks: t.procedure.query(async ({ ctx }) => {
    const accountId = ctx.userInfo.userId;
    const links = await getLinksByAccount(accountId, 100);

    // Get links with clicks in last hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const activeLinks = [];

    for (const link of links) {
      const recentClicks = await getRecentClicks(link.linkId, 1);
      if (recentClicks.length > 0) {
        activeLinks.push({
          linkId: link.linkId,
          name: link.name,
          clicks: recentClicks.length,
        });
      }
    }

    return activeLinks;
  }),

  /**
   * Get total clicks in last hour
   */
  totalLinkClickLastHour: t.procedure.query(async ({ ctx }) => {
    const accountId = ctx.userInfo.userId;
    const clicks = await getClicksByAccount(accountId, 1000);

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneHourAgoStr = oneHourAgo.toISOString().replace("T", " ").split(".")[0];

    const recentClicks = clicks.filter((click) => {
      const clickTime =
        typeof click.clickedTime === "string"
          ? click.clickedTime
          : click.clickedTime;
      return clickTime >= oneHourAgoStr;
    });

    return recentClicks.length;
  }),

  /**
   * Get clicks in last 24 hours vs previous 24 hours
   */
  last24HourClicks: t.procedure.query(async ({ ctx }) => {
    const accountId = ctx.userInfo.userId;
    const clicks = await getClicksByAccount(accountId, 2000);

    const now = Date.now();
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000);
    const previous24Hours = new Date(now - 48 * 60 * 60 * 1000);

    const last24HoursStr = last24Hours.toISOString().replace("T", " ").split(".")[0];
    const previous24HoursStr = previous24Hours.toISOString().replace("T", " ").split(".")[0];

    const last24Count = clicks.filter((c) => c.clickedTime >= last24HoursStr).length;
    const previous24Count = clicks.filter(
      (c) => c.clickedTime >= previous24HoursStr && c.clickedTime < last24HoursStr
    ).length;

    const percentChange =
      previous24Count > 0
        ? Math.round(((last24Count - previous24Count) / previous24Count) * 100)
        : 0;

    return {
      last24Hours: last24Count,
      previous24Hours: previous24Count,
      percentChange,
    };
  }),

  /**
   * Get clicks in last 30 days
   */
  last30DaysClicks: t.procedure.query(async ({ ctx }) => {
    const accountId = ctx.userInfo.userId;
    const clicks = await getClicksByAccount(accountId, 5000);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().replace("T", " ").split(".")[0];

    const last30DaysClicks = clicks.filter((c) => c.clickedTime >= thirtyDaysAgoStr);

    return last30DaysClicks.length;
  }),

  /**
   * Get clicks by country in last 30 days
   */
  clicksByCountry: t.procedure.query(async ({ ctx }) => {
    const accountId = ctx.userInfo.userId;
    const links = await getLinksByAccount(accountId, 100);

    const countryStats: Record<string, number> = {};

    for (const link of links) {
      const clicksByCountry = await getClicksByCountry(link.linkId);
      for (const stat of clicksByCountry) {
        const country = stat.country || "Unknown";
        countryStats[country] = (countryStats[country] || 0) + stat.count;
      }
    }

    return Object.entries(countryStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }),
});
