import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const entitiesTable = pgTable("entities", {
  id: uuid("id").primaryKey().defaultRandom(),
  model: text("model").notNull(),
  userId: uuid("user_id"),            // owner; null = shared/public record
  data: jsonb("data").notNull().default({}),
  createdDate: timestamp("created_date").defaultNow().notNull(),
  updatedDate: timestamp("updated_date").defaultNow().notNull(),
}, (t) => [
  index("entities_model_idx").on(t.model),
  index("entities_user_model_idx").on(t.userId, t.model),
]);

export const insertEntitySchema = createInsertSchema(entitiesTable).omit({ id: true, createdDate: true, updatedDate: true });
export type InsertEntity = z.infer<typeof insertEntitySchema>;
export type Entity = typeof entitiesTable.$inferSelect;
