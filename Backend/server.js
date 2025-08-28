import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import pg from "pg";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { scrapeBlinkit, scrapeSwiggyInstamart, scrapeZepto } from "./node.js";
import { createClient } from "redis";

dotenv.config();

// PostgreSQL connection
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});
db.connect();

const redisClient = createClient({
  url: process.env.REDIS_URL, 
});

redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisClient.on("connect", () => console.log("✅ Connected to Redis"));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();
const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

/* ---------------- JWT Middleware ---------------- */
function authMiddleware(req, res, next) {
  const token = req.cookies.token; 
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid/Expired token" });
    req.user = decoded; 
    next();
  });
}

/* ---------------- OTP + Auth Flow ---------------- */
// Direct login for registered users
app.post("/api/login", async (req, res) => {
  const { email } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM Users WHERE email = $1 AND registered = TRUE",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "User not registered" });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 60 * 60 * 1000,
    });

    console.log(`✅ User ${email} logged in (direct login)`);
    return res.status(200).json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get logged-in user info
app.get("/api/me", authMiddleware, (req, res) => {
  res.status(200).json({ email: req.user.email });
});


// Send OTP
app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email || !email.endsWith("@gmail.com")) {
    return res.status(400).json({ message: "Invalid Gmail Address" });
  }

  try {
    const existingUser = await db.query("SELECT * FROM Users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0 && existingUser.rows[0].registered) {
      return res.status(400).json({ message: "User already registered. Please login." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await redisClient.setEx(`otp:${email}`, 300, otp.toString());

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ZapCompare" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    console.log(`✅ OTP ${otp} sent to ${email}`);
    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending OTP" });
  }
});


// Verify OTP → set JWT in cookie
app.post("/api/check-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (!storedOtp) return res.status(400).json({ valid: false, message: "OTP expired" });
    if (storedOtp !== otp) return res.status(400).json({ valid: false, message: "Invalid OTP" });

    await db.query(
      `INSERT INTO Users (email, registered) VALUES ($1, TRUE)
       ON CONFLICT (email) DO UPDATE SET registered = TRUE`,
      [email]
    );

    await redisClient.del(`otp:${email}`);

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: "development" === "production",
      sameSite: "development" === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    console.log(`🎉 User ${email} logged in`);
    res.status(200).json({ valid: true, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ valid: false, message: "Server error" });
  }
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true, 
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
});

/* ---------------- Protected Search Route ---------------- */
app.get("/search", authMiddleware, async (req, res) => {
  const { brand = "", item = "", limit = 10 } = req.query;
  if (!brand && !item) {
    return res.status(400).json({ error: "Please enter at least a brand or an item" });
  }

  try {
    const cacheKey = `search:${brand}:${item}:${limit}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`⚡ Cache hit for ${brand} ${item}`);
      return res.json(JSON.parse(cached));
    }

    console.log(`🔍 Cache miss → scraping Blinkit, Swiggy & Zepto for: ${brand} ${item}`);
    const results = await Promise.allSettled([
  scrapeBlinkit(brand, item, 10).catch(e => { console.error("Blinkit failed:", e); throw e; }),
  scrapeSwiggyInstamart(brand, item, 10).catch(e => { console.error("Swiggy failed:", e); throw e; }),
  scrapeZepto(brand, item, 10).catch(e => { console.error("Zepto failed:", e); throw e; }),
]);


    const blinkit = results[0].status === "fulfilled" ? results[0].value : [];
    const swiggy = results[1].status === "fulfilled" ? results[1].value : [];
    const zepto = results[2].status === "fulfilled" ? results[2].value : [];

    const responseData = { blinkit, swiggy, zepto };
    await redisClient.setEx(cacheKey, 600, JSON.stringify(responseData));

    res.json(responseData);
  } catch (err) {
    console.error("❌ Scraping failed:", err);
    res.status(500).json({ error: "Unexpected error in scraping", details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

