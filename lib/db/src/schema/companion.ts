import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const companionOutfitsTable = pgTable("companion_outfits", {
  userId: text("user_id").notNull(),
  companionId: text("companion_id").notNull(),
  outfitId: text("outfit_id").notNull(),
  portraitBase64: text("portrait_base64").notNull(),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.companionId, table.outfitId] }),
]);

export type CompanionOutfit = typeof companionOutfitsTable.$inferSelect;
