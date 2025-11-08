import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import searchRoutes from "./routes/searchRoutes";
import chatRoute from "./routes/chatRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "🚀 Backend server is running!",
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Agentic Chat API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      searchTest: "/api/search/test?q=your+query",
      search: "/api/search (POST)",
      chat: "/api/chat (coming soon)",
    },
  });
});

// Routes
//app.use("/api/search", searchRoutes);
app.use("/api/chat", chatRoute);


// Start server
app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Search test: http://localhost:${PORT}/api/search/test?q=latest+AI+news+2025`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("=================================");
});

export default app;
