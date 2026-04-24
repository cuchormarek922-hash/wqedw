import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workers: defineTable({
    name: v.string(),
    active: v.boolean(),
  }),
  timeEntries: defineTable({
    workerId: v.id("workers"),
    date: v.string(), // YYYY-MM-DD
    hours: v.number(),
    note: v.optional(v.string()),
  })
    .index("by_date", ["date"])
    .index("by_worker_date", ["workerId", "date"]),
});
