const { Router } = require("express");
const { getDatabase } = require("../database");

const router = Router();

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * @swagger
 * /items:
 *   get:
 *     summary: List items with pagination and optional regex search
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Regex pattern to search across name and description
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by exact category name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, price, category, id]
 *           default: id
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort direction
 *     responses:
 *       200:
 *         description: Paginated list of items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", (req, res) => {
  const db = getDatabase();

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  const search = req.query.search?.trim() || null;
  const category = req.query.category?.trim() || null;
  const sortField = ["name", "price", "category", "id"].includes(req.query.sort)
    ? req.query.sort
    : "id";
  const sortOrder = req.query.order === "desc" ? "DESC" : "ASC";

  if (search) {
    try {
      new RegExp(search);
    } catch {
      return res.status(400).json({
        success: false,
        error: `Invalid regex pattern: "${search}"`,
      });
    }
  }

  const conditions = [];
  const params = [];

  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  let rows = db
    .prepare(`SELECT * FROM items ${whereClause} ORDER BY ${sortField} ${sortOrder}`)
    .all(...params);

  if (search) {
    const regex = new RegExp(search, "i");
    rows = rows.filter(
      (row) => regex.test(row.name) || regex.test(row.description)
    );
  }

  const totalItems = rows.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedRows = rows.slice(skip, skip + limit);

  res.json({
    success: true,
    data: paginatedRows,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      skip,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    search: search
      ? { term: search, fieldsSearched: ["name", "description"] }
      : null,
  });
});

/**
 * @swagger
 * /items/{id}:
 *   get:
 *     summary: Get a single item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid item ID" });
  }

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);

  if (!item) {
    return res.status(404).json({ success: false, error: "Item not found" });
  }

  res.json({ success: true, data: item });
});

/**
 * @swagger
 * /items/categories/list:
 *   get:
 *     summary: Get all distinct categories
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get("/categories/list", (req, res) => {
  const db = getDatabase();
  const categories = db
    .prepare("SELECT DISTINCT category FROM items ORDER BY category")
    .all()
    .map((row) => row.category);

  res.json({ success: true, data: categories });
});

module.exports = router;
