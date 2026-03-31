// =============================================
//  DAN JOSEPH — BACKEND SERVER
//  Node.js + Express + PostgreSQL
//  Deploy on Render.com (free tier)
// =============================================

const express  = require("express");
const { Pool } = require("pg");
const cors     = require("cors");

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ──────────────────────────────
app.use(express.json());

// Allow requests from your GitHub Pages URL
// Replace YOUR_USERNAME with your actual GitHub username
app.use(cors({
  origin: [
    "https://YOUR_USERNAME.github.io",
    "http://localhost:5500",    // VS Code Live Server
    "http://127.0.0.1:5500",   // VS Code Live Server alternate
    "http://localhost:3000",
  ],
  methods: ["GET", "POST"],
}));

// ── DATABASE CONNECTION ─────────────────────
// The DATABASE_URL is set as an Environment Variable on Render.com
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }  // Required for Render PostgreSQL
    : false,
});

// ── CREATE TABLE (runs on startup) ──────────
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(100) NOT NULL,
        email      VARCHAR(150) NOT NULL,
        subject    VARCHAR(200),
        message    TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✓ Database table ready");
  } catch (err) {
    console.error("✗ Database init error:", err.message);
  }
}

initDB();


// ── ROUTES ──────────────────────────────────

// Health check — visit https://YOUR-APP.onrender.com/
app.get("/", (req, res) => {
  res.json({
    status:  "OK",
    message: "Dan Joseph Portfolio API is running 🚀",
    version: "1.0.0",
  });
});

// POST /api/contact — saves a contact message
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  // Simple email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [name, email, subject || "", message]
    );

    console.log(`✓ New message from ${name} (${email}) — ID: ${result.rows[0].id}`);

    res.status(201).json({
      success: true,
      message: "Your message was received! Dan will get back to you soon.",
      id:      result.rows[0].id,
    });

  } catch (err) {
    console.error("✗ DB insert error:", err.message);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});


// GET /api/messages — view all messages (for your own use)
app.get("/api/messages", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM contacts ORDER BY created_at DESC"
    );
    res.json({ count: result.rows.length, messages: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch messages." });
  }
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


// ── START SERVER ─────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   Dan Joseph Portfolio Backend        ║
  ║   Running on port ${PORT}               ║
  ║   http://localhost:${PORT}              ║
  ╚═══════════════════════════════════════╝
  `);
});
