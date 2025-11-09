import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRoute from "./routes/chatRoutes";
import searchRoutes from "./routes/searchRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "🚀 Backend server running!",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

app.use("/api/chat", chatRoute);
app.use("/api/search", searchRoutes);

app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log("=================================");
});

export default app;
