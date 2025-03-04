import { User, InsertUser, VotingSession, Vote, Notification, InsertNotification } from "@shared/schema";
import session from "express-session";

export interface IStorage {
  sessionStore: session.Store;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;

  // Voting session methods
  getVotingSessions(): Promise<VotingSession[]>;
  getVotingSession(id: number): Promise<VotingSession | undefined>;
  createVotingSession(session: Omit<VotingSession, "id">): Promise<VotingSession>;
  updateVotingSession(id: number, data: Partial<VotingSession>): Promise<VotingSession>;

  // Vote methods
  getVotes(sessionId: number): Promise<Vote[]>;
  getUserVote(sessionId: number, userId: number): Promise<Vote | undefined>;
  addVote(vote: Omit<Vote, "id">): Promise<Vote>;

  // Notification methods
  getUserNotifications(userId: number): Promise<Notification[]>;
  addNotification(notification: Omit<Notification, "id">): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
}