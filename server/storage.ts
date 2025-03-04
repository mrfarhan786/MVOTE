import { IStorage } from "./types";
import { User, InsertUser, VotingSession, Vote, Notification } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { users, votingSessions, votes, notifications } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize session store with table creation
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true,
      tableName: 'user_sessions'
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, SALT_ROUNDS);

    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    // If password is being updated, hash it
    if (data.password) {
      data.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    // If updating username, check if it already exists
    if (data.username) {
      const existingUser = await this.getUserByUsername(data.username);
      if (existingUser && existingUser.id !== id) {
        throw new Error("Username already exists");
      }
    }

    // Only update the fields that were provided
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  // Voting session methods
  async getVotingSessions(): Promise<VotingSession[]> {
    return await db
      .select()
      .from(votingSessions)
      .orderBy(desc(votingSessions.startDate));
  }

  async getVotingSession(id: number): Promise<VotingSession | undefined> {
    const [session] = await db
      .select()
      .from(votingSessions)
      .where(eq(votingSessions.id, id));
    return session;
  }

  async createVotingSession(sessionData: Omit<VotingSession, "id">): Promise<VotingSession> {
    const [session] = await db
      .insert(votingSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async updateVotingSession(id: number, data: Partial<VotingSession>): Promise<VotingSession> {
    const [updatedSession] = await db
      .update(votingSessions)
      .set(data)
      .where(eq(votingSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Vote methods
  async getVotes(sessionId: number): Promise<Vote[]> {
    return await db
      .select()
      .from(votes)
      .where(eq(votes.sessionId, sessionId));
  }

  async getUserVote(sessionId: number, userId: number): Promise<Vote | undefined> {
    const [vote] = await db
      .select()
      .from(votes)
      .where(
        eq(votes.sessionId, sessionId) && 
        eq(votes.userId, userId)
      );
    return vote;
  }

  async addVote(vote: Omit<Vote, "id">): Promise<Vote> {
    const [newVote] = await db
      .insert(votes)
      .values(vote)
      .returning();
    return newVote;
  }

  // Notification methods
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.timestamp));
  }

  async addNotification(notification: Omit<Notification, "id">): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
  }

  async deleteNotification(id: number): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, id));
  }

  async deleteAllNotifications(userId: number): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.userId, userId));
  }

  // Add method to verify password
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export const storage = new DatabaseStorage();