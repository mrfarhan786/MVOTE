import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertVotingSessionSchema, insertVoteSchema, insertNotificationSchema, completeProfileSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Configure multer for image upload
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage: multerStorage });

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Add profile completion endpoint
  app.post("/api/complete-profile", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const data = completeProfileSchema.parse(req.body);

      // Check if username already exists
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const updatedUser = await storage.updateUser(req.user.id, {
        ...data,
        profileCompleted: true,
      });

      // Update session
      req.login(updatedUser, (err) => {
        if (err) return res.sendStatus(400); //Error handling improved
        res.json(updatedUser);
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // File upload route
  app.post("/api/upload", upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  });

  // Update user profile
  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      // Check if username is being updated
      if (req.body.username && req.body.username !== req.user.username) {
        // Check if new username already exists
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      const updatedUser = await storage.updateUser(req.user.id, req.body);
      // Update the session with the new user data
      req.login(updatedUser, (err) => {
        if (err) return res.sendStatus(400); //Error handling improved
        res.json(updatedUser);
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Voting Sessions
  app.get("/api/voting-sessions", async (req, res) => {
    const sessions = await storage.getVotingSessions();
    res.json(sessions);
  });

  app.get("/api/voting-sessions/:id", async (req, res) => {
    const session = await storage.getVotingSession(parseInt(req.params.id));
    if (!session) {
      return res.status(404).json({ message: "Voting session not found" });
    }
    res.json(session);
  });

  // Update the voting session creation route
  app.post("/api/voting-sessions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const sessionData = {
        ...req.body,
        createdBy: req.user.id,
      };

      const parsed = insertVotingSessionSchema.parse(sessionData);
      const session = await storage.createVotingSession(parsed);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/voting-sessions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const session = await storage.getVotingSession(parseInt(req.params.id));
    if (!session) {
      return res.status(404).json({ message: "Voting session not found" });
    }
    if (session.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this session" });
    }
    const updatedSession = await storage.updateVotingSession(parseInt(req.params.id), req.body);
    res.json(updatedSession);
  });

  // Votes
  app.get("/api/voting-sessions/:id/votes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const votes = await storage.getVotes(parseInt(req.params.id));
    res.json(votes);
  });

  // Update the vote creation route
  app.post("/api/voting-sessions/:id/votes", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const sessionId = parseInt(req.params.id);

    try {
      // Check if session exists and is active
      const session = await storage.getVotingSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Voting session not found" });
      }
      if (session.status !== 'active') {
        return res.status(400).json({ message: "Voting session is not active" });
      }

      // Check if user has already voted
      const existingVote = await storage.getUserVote(sessionId, req.user.id);
      if (existingVote) {
        return res.status(400).json({ message: "You have already voted in this session" });
      }

      const voteData = {
        ...req.body,
        sessionId,
        userId: req.user.id,
      };

      const parsed = insertVoteSchema.parse(voteData);
      const vote = await storage.addVote(parsed);
      res.status(201).json(vote);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json([]); // Return empty array for demo mode
    }
    const notifications = await storage.getUserNotifications(req.user.id);
    res.json(notifications);
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteNotification(parseInt(req.params.id));
    res.sendStatus(200);
  });

  app.delete("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.deleteAllNotifications(req.user.id);
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}