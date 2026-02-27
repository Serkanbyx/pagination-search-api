const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pagination & Search API",
      version: "1.0.0",
      description:
        "A RESTful API demonstrating pagination with `limit`/`skip` and regex-powered search over an SQLite database.",
      contact: {
        name: "Serkanby",
        url: "https://serkanbayraktar.com/",
      },
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || "http://localhost:3000",
        description: process.env.RENDER_EXTERNAL_URL ? "Production" : "Local",
      },
    ],
    components: {
      schemas: {
        Item: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Premium Widget 1" },
            category: { type: "string", example: "Electronics" },
            price: { type: "number", format: "float", example: 29.99 },
            description: {
              type: "string",
              example:
                "High-quality premium widget in the electronics category.",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Item" },
            },
            pagination: {
              type: "object",
              properties: {
                totalItems: { type: "integer", example: 500 },
                totalPages: { type: "integer", example: 50 },
                currentPage: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                skip: { type: "integer", example: 0 },
                hasNextPage: { type: "boolean", example: true },
                hasPrevPage: { type: "boolean", example: false },
              },
            },
            search: {
              type: "object",
              nullable: true,
              properties: {
                term: { type: "string", example: "widget" },
                fieldsSearched: {
                  type: "array",
                  items: { type: "string" },
                  example: ["name", "description"],
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: { type: "string", example: "Something went wrong" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerSpec };
