import { pgTable, text, serial, integer, boolean, date, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Add proper typing for voting session status
export const votingSessionStatus = ['pending', 'active', 'completed', 'cancelled'] as const;
export type VotingSessionStatus = typeof votingSessionStatus[number];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  profileCompleted: boolean("profile_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const votingSessions = pgTable("voting_sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  status: text("status", { enum: votingSessionStatus }).notNull().default('pending'),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => votingSessions.id),
  userId: integer("user_id").notNull().references(() => users.id),
  choice: text("choice").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  read: boolean("read").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users, {
  id: undefined,
  createdAt: undefined,
  profileCompleted: undefined,
  username: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImage: z.string().optional(),
}).extend({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const insertVotingSessionSchema = createInsertSchema(votingSessions, {
  id: undefined,
  status: z.enum(votingSessionStatus).default('pending'),
});

export const insertVoteSchema = createInsertSchema(votes, {
  id: undefined,
  timestamp: z.date().default(() => new Date()),
});

export const insertNotificationSchema = createInsertSchema(notifications, {
  id: undefined,
  timestamp: undefined,
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const completeProfileSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type VotingSession = typeof votingSessions.$inferSelect;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type CompleteProfile = z.infer<typeof completeProfileSchema>;