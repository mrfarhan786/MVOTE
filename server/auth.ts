import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser, users } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: 'x1y2z3-a4b5c6-m7n8p9-q0r1s2-t3u4v5w6-dev',  // Secure key for local development
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: app.get("env") === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
      path: '/',
      httpOnly: true
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: 'identifier',
        passwordField: 'password',
      },
      async (identifier, password, done) => {
        try {
          // First try to find user by username
          let user = await storage.getUserByUsername(identifier);

          // If not found by username, try by email
          if (!user) {
            const [userByEmail] = await db
              .select()
              .from(users)
              .where(eq(users.email, identifier));
            user = userByEmail;
          }

          if (!user) {
            return done(null, false, { message: "Invalid credentials" });
          }

          const isValidPassword = await storage.verifyPassword(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid credentials" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      // Check if email already exists
      const [existingEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, req.body.email));
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Check username if provided
      if (req.body.username) {
        const existingUsername = await storage.getUserByUsername(req.body.username);
        if (existingUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      const user = await storage.createUser(req.body);

      try {
        await storage.addNotification({
          userId: user.id,
          title: "Welcome to MVote!",
          description: `Welcome! Your account has been created successfully. Start by creating your first voting session.`,
          timestamp: new Date(),
          read: false,
        });
      } catch (error) {
        console.error('Failed to create welcome notification:', error);
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Login after registration failed:', err);
          return res.status(500).json({ message: "Registration successful but auto-login failed" });
        }
        res.status(201).json(user);
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate(
      "local",
      async (
        err: Error | null,
        user: Express.User | false | null,
        info: { message: string } | undefined
      ) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: info?.message || "Authentication failed" });
        }

        req.login(user, async (err) => {
          if (err) return next(err);

          try {
            await storage.addNotification({
              userId: user.id,
              title: "Welcome Back!",
              description: `Good to see you again${user.firstName ? ', ' + user.firstName : ''}! You've successfully logged in.`,
              timestamp: new Date(),
              read: false,
            });
          } catch (error) {
            console.error('Failed to create login notification:', error);
          }

          res.json(user);
        });
      }
    )(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json(null);
    }
    res.json(req.user);
  });
}
