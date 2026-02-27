const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./swagger");
const itemsRouter = require("./routes/items");
const { getDatabase } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pagination &amp; Search API</title>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      background: #0a0e1a;
      color: #e2e8f0;
      overflow: hidden;
      position: relative;
    }

    /* Data grid pattern background */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(56, 189, 248, 0.04) 59px, rgba(56, 189, 248, 0.04) 60px),
        repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(56, 189, 248, 0.04) 59px, rgba(56, 189, 248, 0.04) 60px);
      z-index: 0;
    }

    /* Radial glow accent */
    body::after {
      content: '';
      position: fixed;
      top: -30%;
      right: -20%;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%);
      border-radius: 50%;
      z-index: 0;
    }

    .container {
      position: relative;
      z-index: 1;
      text-align: center;
      padding: 3rem 2rem;
      max-width: 520px;
      width: 100%;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(56, 189, 248, 0.12);
      border-radius: 20px;
      backdrop-filter: blur(16px);
      box-shadow:
        0 0 60px rgba(56, 189, 248, 0.06),
        0 25px 50px rgba(0, 0, 0, 0.4);
    }

    /* Magnifying glass decoration */
    .container::before {
      content: '';
      position: absolute;
      top: -38px;
      left: 50%;
      transform: translateX(-50%);
      width: 56px;
      height: 56px;
      border: 3px solid rgba(56, 189, 248, 0.5);
      border-radius: 50%;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
    }
    .container::after {
      content: '';
      position: absolute;
      top: 12px;
      left: calc(50% + 18px);
      width: 3px;
      height: 18px;
      background: rgba(56, 189, 248, 0.5);
      border-radius: 2px;
      transform: rotate(-45deg);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
    }

    h1 {
      margin-top: 1.2rem;
      font-size: 1.85rem;
      font-weight: 800;
      letter-spacing: 1px;
      background: linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .version {
      display: inline-block;
      margin-top: 0.6rem;
      padding: 0.2rem 0.9rem;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 1.5px;
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 20px;
      background: rgba(56, 189, 248, 0.06);
    }

    /* Pagination dots decoration */
    .dots {
      display: flex;
      justify-content: center;
      gap: 6px;
      margin: 1.6rem 0;
    }
    .dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(56, 189, 248, 0.15);
      transition: all 0.3s ease;
    }
    .dots span.active {
      width: 24px;
      border-radius: 4px;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.3);
    }

    .links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .links a {
      display: block;
      padding: 0.85rem 1.5rem;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 600;
      border-radius: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: 0.3px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      color: #0f172a;
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.25);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(56, 189, 248, 0.35);
      filter: brightness(1.1);
    }

    .btn-secondary {
      background: rgba(56, 189, 248, 0.08);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.2);
    }
    .btn-secondary:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(56, 189, 248, 0.1);
    }

    .btn-tertiary {
      background: rgba(129, 140, 248, 0.08);
      color: #818cf8;
      border: 1px solid rgba(129, 140, 248, 0.15);
    }
    .btn-tertiary:hover {
      background: rgba(129, 140, 248, 0.15);
      border-color: rgba(129, 140, 248, 0.35);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(129, 140, 248, 0.1);
    }

    .sign {
      margin-top: 2.2rem;
      padding-top: 1.2rem;
      border-top: 1px solid rgba(56, 189, 248, 0.08);
      font-size: 0.8rem;
      color: #64748b;
      letter-spacing: 0.3px;
    }
    .sign a {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .sign a:hover {
      color: #818cf8;
    }

    @media (max-width: 560px) {
      .container { margin: 1.5rem; padding: 2rem 1.5rem; }
      h1 { font-size: 1.4rem; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Pagination &amp; Search API</h1>
    <p class="version">v1.0.0</p>

    <div class="dots">
      <span></span>
      <span></span>
      <span class="active"></span>
      <span></span>
      <span></span>
    </div>

    <div class="links">
      <a href="/api-docs" class="btn-primary">API Documentation</a>
      <a href="/items?page=1&limit=10" class="btn-secondary">Browse Items</a>
      <a href="/items/categories/list" class="btn-tertiary">Categories</a>
    </div>

    <footer class="sign">
      Created by
      <a href="https://serkanbayraktar.com/" target="_blank" rel="noopener noreferrer">Serkanby</a>
      |
      <a href="https://github.com/Serkanbyx" target="_blank" rel="noopener noreferrer">Github</a>
    </footer>
  </div>
</body>
</html>`);
});

app.use("/items", itemsRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal server error" });
});

const db = getDatabase();
const count = db.prepare("SELECT COUNT(*) as count FROM items").get();
if (count.count === 0) {
  console.log("No items found. Auto-seeding database...");
  const { seed } = require("./seed");
  seed();
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
  console.log(`Items in DB: ${count.count}`);
});
