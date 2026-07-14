import { pgTable, uuid, text, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash"),
  fullName: text("full_name"),
  dateOfBirth: date("date_of_birth"),
  mobileNumber: text("mobile_number"),
  emailVerified: boolean("email_verified").default(false),
  avatarUrl: text("avatar_url"),
  role: text("role").default("user"),
  stripeCustomerId: text("stripe_customer_id"),
  createdDate: timestamp("created_date").defaultNow().notNull(),
  updatedDate: timestamp("updated_date").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdDate: true, updatedDate: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
