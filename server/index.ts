import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { generateValidationReport } from "./_core/llmValidator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Enable JSON parsing for API endpoints
  app.use(express.json({ limit: '10mb' }));

  // API endpoint for AI validation (MUST come before static files)
  app.post("/api/validate-calculations", async (req, res) => {
    try {
      const { formulas, inputs, inputDescriptions, projections } = req.body;
      
      const report = await generateValidationReport(
        formulas,
        inputs,
        inputDescriptions,
        projections
      );
      
      res.json(report);
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ 
        error: 'Validation failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
