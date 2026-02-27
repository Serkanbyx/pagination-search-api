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
  res.json({
    message: "Pagination & Search API",
    version: "1.0.0",
    endpoints: {
      docs: "/api-docs",
      items: "/items?page=1&limit=10&search=widget",
      itemById: "/items/:id",
      categories: "/items/categories/list",
    },
  });
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
