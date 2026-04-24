import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const setHours = mutation({
  args: {
    workerId: v.id("workers"),
    date: v.string(),
    hours: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { workerId, date, hours, note }) => {
    const existing = await ctx.db
      .query("timeEntries")
      .withIndex("by_worker_date", (q) =>
        q.eq("workerId", workerId).eq("date", date)
      )
      .first();

    if (existing) {
      if (hours === 0 && !note) {
        await ctx.db.delete(existing._id);
      } else {
        await ctx.db.patch(existing._id, { hours, note });
      }
    } else if (hours > 0) {
      await ctx.db.insert("timeEntries", { workerId, date, hours, note });
    }
  },
});

export const getForDateRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, { startDate, endDate }) => {
    const all = await ctx.db.query("timeEntries").collect();
    return all.filter((e) => e.date >= startDate && e.date <= endDate);
  },
});
