# Pagination & Search API

A RESTful API built with **Express**, **SQLite**, and **Swagger** that demonstrates server-side pagination with `limit`/`skip` and regex-powered search.

## Features

- **Pagination** — `page` & `limit` query params with full metadata (totalItems, totalPages, hasNext/hasPrev)
- **Regex Search** — JavaScript regex patterns applied across `name` and `description` fields
- **Category Filter** — exact match filtering by category
- **Sorting** — sort by `name`, `price`, `category`, or `id` in `asc`/`desc` order
- **Swagger Docs** — interactive API documentation at `/api-docs`
- **SQLite** — lightweight, zero-config database via `better-sqlite3`

## Quick Start

```bash
# Install dependencies
npm install

# Seed the database with 500 sample items
npm run seed

# Start the server
npm start

# Or use watch mode for development
npm run dev
```

Server runs at **http://localhost:3000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info and available endpoints |
| GET | `/items` | List items with pagination & search |
| GET | `/items/:id` | Get a single item by ID |
| GET | `/items/categories/list` | Get all distinct categories |
| GET | `/api-docs` | Swagger UI documentation |

## Query Parameters for `/items`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `limit` | integer | 10 | Items per page (max 100) |
| `search` | string | — | Regex pattern for name/description |
| `category` | string | — | Exact category filter |
| `sort` | string | id | Sort field: `name`, `price`, `category`, `id` |
| `order` | string | asc | Sort direction: `asc`, `desc` |

## Example Requests

```bash
# Page 2 with 10 items per page
GET /items?page=2&limit=10

# Search for items matching "widget" pattern
GET /items?search=widget

# Combined: search + category + sort
GET /items?page=1&limit=5&search=premium&category=Electronics&sort=price&order=desc
```

## Deploy to Render

1. Push the repo to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your repo — Render auto-detects `render.yaml`
4. Build command: `npm install && npm run seed`
5. Start command: `npm start`

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: SQLite (better-sqlite3)
- **Docs**: Swagger (swagger-jsdoc + swagger-ui-express)
