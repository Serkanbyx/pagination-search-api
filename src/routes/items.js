const { Router } = require("express");
const { getDatabase } = require("../database");

const router = Router();

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;
const ALLOWED_SORT_FIELDS = ["name", "price", "category", "id"];

const validateItemInput = (body, isPartial = false) => {
  const errors = [];

  if (!isPartial || body.name !== undefined) {
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      errors.push("name is required and must be a non-empty string");
    } else if (body.name.trim().length > 200) {
      errors.push("name must be at most 200 characters");
    }
  }

  if (!isPartial || body.category !== undefined) {
    if (!body.category || typeof body.category !== "string" || !body.category.trim()) {
      errors.push("category is required and must be a non-empty string");
    }
  }

  if (!isPartial || body.price !== undefined) {
    if (body.price == null || typeof body.price !== "number" || body.price <= 0) {
      errors.push("price is required and must be a positive number");
    }
  }

  if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
    errors.push("description must be a string");
  }

  return errors;
};

/**
 * @swagger
 * /items:
 *   get:
 *     summary: List items with pagination and search
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
 *           maxLength: 100
 *         description: Search term to match against name and description (case-insensitive)
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
  const sortField = ALLOWED_SORT_FIELDS.includes(req.query.sort) ? req.query.sort : "id";
  const sortOrder = req.query.order === "desc" ? "DESC" : "ASC";

  if (search && search.length > MAX_SEARCH_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Search term must be at most ${MAX_SEARCH_LENGTH} characters`,
    });
  }

  const conditions = [];
  const params = [];

  if (search) {
    conditions.push("(name LIKE ? COLLATE NOCASE OR description LIKE ? COLLATE NOCASE)");
    const likePattern = `%${search}%`;
    params.push(likePattern, likePattern);
  }

  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const { count: totalItems } = db
    .prepare(`SELECT COUNT(*) as count FROM items ${whereClause}`)
    .get(...params);

  const totalPages = Math.ceil(totalItems / limit);

  const rows = db
    .prepare(`SELECT * FROM items ${whereClause} ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`)
    .all(...params, limit, skip);

  res.json({
    success: true,
    data: rows,
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
router.get("/categories/list", (_req, res) => {
  const db = getDatabase();
  const categories = db
    .prepare("SELECT DISTINCT category FROM items ORDER BY category")
    .all()
    .map((row) => row.category);

  res.json({ success: true, data: categories });
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
 * /items:
 *   post:
 *     summary: Create a new item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", (req, res) => {
  const errors = validateItemInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join("; ") });
  }

  const db = getDatabase();
  const { name, category, price, description } = req.body;

  const result = db
    .prepare("INSERT INTO items (name, category, price, description) VALUES (?, ?, ?, ?)")
    .run(name.trim(), category.trim(), price, description?.trim() || null);

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(result.lastInsertRowid);

  res.status(201).json({ success: true, data: item });
});

/**
 * @swagger
 * /items/{id}:
 *   put:
 *     summary: Update an existing item
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemInput'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid item ID" });
  }

  const existing = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: "Item not found" });
  }

  const errors = validateItemInput(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, error: errors.join("; ") });
  }

  const { name, category, price, description } = req.body;

  db.prepare("UPDATE items SET name = ?, category = ?, price = ?, description = ? WHERE id = ?")
    .run(name.trim(), category.trim(), price, description?.trim() || null, id);

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(id);

  res.json({ success: true, data: item });
});

/**
 * @swagger
 * /items/{id}:
 *   delete:
 *     summary: Delete an item
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
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid item ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", (req, res) => {
  const db = getDatabase();
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid item ID" });
  }

  const existing = db.prepare("SELECT * FROM items WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ success: false, error: "Item not found" });
  }

  db.prepare("DELETE FROM items WHERE id = ?").run(id);

  res.json({ success: true, message: `Item ${id} deleted successfully` });
});

module.exports = router;
