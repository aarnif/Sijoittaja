import { RedisStore } from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import passport from "passport";
import { configurePassport } from "./config/oidcConfig";
import authRoutes from "./routes/authRoutes";

const app = express();

const isProduction = process.env.NODE_ENV === "production";

const corsOrigin = isProduction
  ? process.env.FRONTEND_URL
  : "http://localhost:5173";

if (isProduction && !corsOrigin) {
  throw new Error("FRONTEND_URL required in production");
}

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const setUpSession = async () => {
  if (isProduction) {
    console.log("Setting up Redis session store for production");

    const redisClient = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on("error", (err) => console.log("Redis Client Error", err));
    redisClient.on("connect", () => console.log("Connected to Redis"));

    const redisStore = new RedisStore({
      client: redisClient,
      prefix: "sess:",
    });

    app.use(
      session({
        store: redisStore,
        secret: process.env.SESSION_SECRET || "fallback-secret-change-this",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: true, // HTTPS only in production
          httpOnly: true, // XSS protection
          maxAge: parseInt(process.env.SESSION_MAX_AGE || "86400000"), // 24h
          sameSite: "lax",
        },
      }),
    );
  } else {
    console.log("Using memory store for sessions (development only)");
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "dev-secret-change-this",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // HTTP only for development
          httpOnly: true, // XSS protection
          maxAge: parseInt(process.env.SESSION_MAX_AGE || "86400000"), // 24h
          sameSite: "lax",
        },
      }),
    );
  }

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(
    (user: Express.User, done: (err: any, id?: Express.User) => void) => {
      done(null, user);
    },
  );

  passport.deserializeUser(
    (user: Express.User, done: (err: any, user?: Express.User) => void) => {
      done(null, user);
    },
  );

  await configurePassport();

  app.use("/api", authRoutes);

  app.get("/ping", (_req, res) => {
    console.log("someone pinged here");
    res.send("pong");
  });

  // Test route to check server health
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      redis: isProduction ? "enabled" : "disabled",
    });
  });
};

setUpSession().catch((err) => {
  console.error("Failed to setup session:", err);
  process.exit(1);
});

export default app;
