import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Todo API",
            version: "1.0.0",
            description: "A Todo list API with JWT auth and role-based access control."
        },
        servers: [
            { url: "http://localhost:3000", description: "Local dev server" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            },
            schemas: {
                Todo: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        completed: { type: "boolean" },
                        userId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" }
                    }
                },
                Error: {
                    type: "object",
                    properties: {
                        message: { type: "string" }
                    }
                }
            }
        },
        security: [{ bearerAuth: [] }]
    },
    apis: ["./src/routes/*.ts"]
};

export const swaggerSpec = swaggerJsdoc(options);