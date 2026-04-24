import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("workers")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("workers").collect();
  },
});

export const add = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    return await ctx.db.insert("workers", { name, active: true });
  },
});

export const setActive = mutation({
  args: { id: v.id("workers"), active: v.boolean() },
  handler: async (ctx, { id, active }) => {
    await ctx.db.patch(id, { active });
  },
});

export const remove = mutation({
  args: { id: v.id("workers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
