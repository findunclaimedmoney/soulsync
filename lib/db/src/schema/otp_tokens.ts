import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const otpTokensTable = pgTable("otp_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  tokenType: text("token_type").notNull().default("registration"), // "registration" | "password_reset"
  used: boolean("used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdDate: timestamp("created_date").defaultNow().notNull(),
});

export type OtpToken = typeof otpTokensTable.$inferSelect;
