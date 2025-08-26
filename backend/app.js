const express = require("express");
const path = require("path");
const fs = require("fs/promises");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const app = express();

// Basic hardening
app.use(helmet());
app.use(express.json({ limit: "100kb" }));

// CORS (allow vite dev by default)
const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin, credentials: true }));

// Logging
app.use(morgan("tiny"));

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use(limiter);

const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, "data", "items.json");

// Zod schema
const ItemSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(200),
});

const ItemsSchema = z.array(ItemSchema);

// Helpers for safe FS read/write
async function readItems() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const items = ItemsSchema.parse(parsed);
    return items;
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, "[]", "utf-8");
      return [];
    }
    throw err;
  }
}

async function writeItems(items) {
  ItemsSchema.parse(items); // validate before write
  const tmpPath = DATA_FILE + ".tmp";
  await fs.writeFile(tmpPath, JSON.stringify(items, null, 2), "utf-8");
  await fs.rename(tmpPath, DATA_FILE); // atomic replace
}

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/items", async (_req, res, next) => {
  try {
    const items = await readItems();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

app.post("/api/items", async (req, res, next) => {
  try {
    const title = z.string().min(1).max(200).parse(req.body.title);
    const items = await readItems();
    const newItem = { id: Date.now(), title };
    items.push(newItem);
    await writeItems(items);
    res.status(201).json(newItem);
  } catch (e) {
    next(e);
  }
});

app.put("/api/items/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new Error("Invalid id");
    const title = z.string().min(1).max(200).parse(req.body.title);
    const items = await readItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    items[idx].title = title;
    await writeItems(items);
    res.json(items[idx]);
  } catch (e) {
    next(e);
  }
});

app.delete("/api/items/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw new Error("Invalid id");
    const items = await readItems();
    const nextItems = items.filter((i) => i.id !== id);
    if (nextItems.length === items.length) return res.status(404).json({ error: "Not found" });
    await writeItems(nextItems);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// Serve frontend build if available (optional)
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get("*", async (_req, res, next) => {
  try {
    const indexPath = path.join(frontendDist, "index.html");
    await fs.stat(indexPath);
    res.sendFile(indexPath);
  } catch {
    next();
  }
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Bad Request" });
});

module.exports = app;
