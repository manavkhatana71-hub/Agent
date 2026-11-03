import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import Groq from "groq-sdk";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors()); // In production, restrict this to your deployed website origin.
app.use(express.json({ limit: "1mb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 30 }));
app.use(express.static(path.join(__dirname, "public")));

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, configured: Boolean(groq), model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile" });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!groq) return res.status(503).json({ error: "Groq API key is not configured on the server." });
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return res.status(400).json({ error: "Send between 1 and 30 messages." });
    }
    const safeMessages = messages.map((m) => {
      if (!["user", "assistant"].includes(m.role) || typeof m.content !== "string") {
        throw new Error("Invalid message format.");
      }
      return { role: m.role, content: m.content.slice(0, 12000) };
    });

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are EMI AI, a helpful, capable assistant. Be clear and practical.
When asked to create a website, game, or code project, provide complete files.
Format each file as a heading containing its path (example: ### index.html), followed by a fenced code block with the correct language.
Do not claim you installed apps, controlled the device, created files on the user's device, or performed actions unless a connected tool actually did so.
For Android actions, explain that this web version can guide the user; device automation requires the separate Android app and user permissions.`
        },
        ...safeMessages
      ]
    });
    res.json({ reply: completion.choices?.[0]?.message?.content || "I could not create a response." });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ error: error.message || "AI request failed." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(port, () => console.log(`EMI AI running at http://localhost:${port}`));
