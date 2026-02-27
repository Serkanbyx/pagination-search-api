# 📄 Pagination & Search API

A modern RESTful API built with Express 5, SQLite, and Swagger that demonstrates server-side pagination with `limit`/`skip`, regex-powered search, category filtering, and flexible sorting — all served with interactive API documentation.

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Server-Side Pagination**: `page` & `limit` query parameters with full metadata including `totalItems`, `totalPages`, `hasNextPage`, and `hasPrevPage`
- **Regex Search**: JavaScript regex patterns applied across `name` and `description` fields simultaneously
- **Category Filtering**: Exact-match filtering by product category with a dedicated categories endpoint
- **Flexible Sorting**: Sort by `name`, `price`, `category`, or `id` in ascending or descending order
- **Swagger Documentation**: Interactive OpenAPI 3.0 documentation at `/api-docs` for easy testing
- **SQLite Database**: Lightweight, zero-config embedded database via `better-sqlite3` with WAL mode
- **Auto-Seeding**: Automatically seeds 500 sample items on first run if the database is empty
- **CORS Enabled**: Cross-origin requests supported out of the box
- **Render Ready**: One-click deployment with `render.yaml` configuration

## Live Demo

[🌐 View Live API](https://pagination-search-api.onrender.com/)

[📖 Swagger Documentation](https://pagination-search-api.onrender.com/api-docs)

## Technologies

- **Node.js (>=18)**: JavaScript runtime environment
- **Express 5**: Fast, minimalist web framework for Node.js
- **SQLite (better-sqlite3)**: Embedded relational database with synchronous API
- **Swagger (swagger-jsdoc + swagger-ui-express)**: Auto-generated interactive API documentation
- **CORS**: Cross-Origin Resource Sharing middleware

## Installation

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/Serkanbyx/Pagination-Search-API.git
cd Pagination-Search-API
```

2. Install dependencies:

```bash
npm install
```

3. Seed the database with 500 sample items:

```bash
npm run seed
```

4. Start the server:

```bash
npm start
```

5. Open your browser and navigate to:

- API Root: [http://localhost:3000](http://localhost:3000)
- Swagger Docs: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### Development Mode (Watch)

```bash
npm run dev
```

This uses Node.js built-in `--watch` flag to auto-restart on file changes.

## Usage

1. Start the server with `npm start` — the database auto-seeds if empty
2. Open the Swagger UI at `/api-docs` to explore endpoints interactively
3. Use the `/items` endpoint with query parameters to paginate, search, filter, and sort
4. Retrieve a single item by ID via `/items/:id`
5. Get all available categories from `/items/categories/list`

## API Endpoints

| Method | Endpoint | Description |
| ------ | ----------------------- | ---------------------------------------- |
| GET | `/` | API info and available endpoints |
| GET | `/items` | List items with pagination, search & sort |
| GET | `/items/:id` | Get a single item by ID |
| GET | `/items/categories/list` | Get all distinct categories |
| GET | `/api-docs` | Interactive Swagger UI documentation |

## How It Works?

### Query Parameters

The `/items` endpoint accepts the following query parameters:

| Param | Type | Default | Description |
| ---------- | ------- | ------- | -------------------------------------------------- |
| `page` | integer | 1 | Page number (1-based) |
| `limit` | integer | 10 | Items per page (max 100) |
| `search` | string | — | Regex pattern to match against name & description |
| `category` | string | — | Exact category filter |
| `sort` | string | id | Sort field: `name`, `price`, `category`, `id` |
| `order` | string | asc | Sort direction: `asc` or `desc` |

### Pagination Response Structure

Every paginated response includes a `pagination` object:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "totalItems": 500,
    "totalPages": 50,
    "currentPage": 1,
    "limit": 10,
    "skip": 0,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "search": null
}
```

### Regex Search

The `search` parameter accepts JavaScript regex patterns. The pattern is tested against both `name` and `description` fields (case-insensitive):

```bash
# Find items containing "widget"
GET /items?search=widget

# Find items starting with "Premium"
GET /items?search=^Premium

# Find items with "smart" or "wireless" in their name/description
GET /items?search=smart|wireless
```

### Example Requests

```bash
# Basic pagination — page 2, 10 items per page
GET /items?page=2&limit=10

# Search for items matching "gadget"
GET /items?search=gadget

# Filter by category
GET /items?category=Electronics

# Combined: search + category + sort by price descending
GET /items?page=1&limit=5&search=premium&category=Electronics&sort=price&order=desc

# Get all categories
GET /items/categories/list
```

### Database Schema

```sql
CREATE TABLE items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  category    TEXT    NOT NULL,
  price       REAL    NOT NULL,
  description TEXT
);
```

Indexes are created on `name` and `category` fields for optimized query performance.

### Project Structure

```
├── src/
│   ├── server.js        # Express app setup and server initialization
│   ├── database.js      # SQLite connection and schema management
│   ├── seed.js          # Database seeding script (500 sample items)
│   ├── swagger.js       # OpenAPI/Swagger configuration
│   └── routes/
│       └── items.js     # Item endpoints with pagination & search logic
├── data/                # SQLite database file (auto-generated, git-ignored)
├── render.yaml          # Render.com deployment config
└── package.json         # Dependencies and scripts
```

## Customization

### Change the Number of Seed Items

In `src/seed.js`, modify the `TOTAL_ITEMS` constant:

```javascript
const TOTAL_ITEMS = 1000; // Default: 500
```

### Add New Categories

Update the `CATEGORIES` array in `src/seed.js`:

```javascript
const CATEGORIES = [
  "Electronics",
  "Books",
  "Clothing",
  // Add your custom categories here
  "Furniture",
  "Jewelry",
];
```

### Change Pagination Defaults

In `src/routes/items.js`, modify the constants:

```javascript
const DEFAULT_LIMIT = 20; // Default items per page
const MAX_LIMIT = 200;    // Maximum items per page
```

## Deploy to Render

1. Push the repository to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repository — Render auto-detects `render.yaml`
4. The build and start commands are pre-configured:
   - **Build**: `npm install && npm run seed`
   - **Start**: `npm start`
5. Deploy and access your live API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m "feat: add amazing feature"`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Commit Message Format

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code refactoring
- `docs:` — Documentation changes
- `chore:` — Maintenance tasks

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)

## Contact

- [Open an Issue](https://github.com/Serkanbyx/Pagination-Search-API/issues)
- Email: [serkanbyx1@gmail.com](mailto:serkanbyx1@gmail.com)
- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
