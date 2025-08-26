const request = require("supertest");
const path = require("path");
const fs = require("fs/promises");
let app;
let DATA_FILE;

beforeEach(async () => {
  DATA_FILE = path.join(__dirname, "tmp-items.json");
  process.env.DATA_FILE = DATA_FILE;
  await fs.writeFile(DATA_FILE, "[]", "utf-8");
  app = require("../app");
});

afterEach(async () => {
  try { await fs.unlink(DATA_FILE); } catch {}
  delete process.env.DATA_FILE;
  // purge module cache for app
  delete require.cache[require.resolve("../app")];
});

test("GET /api/items returns empty array initially", async () => {
  const res = await request(app).get("/api/items");
  expect(res.status).toBe(200);
  expect(res.body).toEqual([]);
});

test("POST /api/items creates an item", async () => {
  const res = await request(app).post("/api/items").send({ title: "Hello" });
  expect(res.status).toBe(201);
  expect(res.body.title).toBe("Hello");
  const list = await request(app).get("/api/items");
  expect(list.body.length).toBe(1);
});

