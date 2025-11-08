
import dotenv from "dotenv";
import { getAIResponse } from "./src/services/aiService"; // path to your aiService.ts

dotenv.config();

async function testAI() {
  const prompt = "Explain in simple terms how ChatGPT works.";
  console.log("🔹 Sending prompt to Gemini AI:", prompt);

  const response = await getAIResponse(prompt);

  console.log("🔹 AI Response:");
  console.log(response);
}

testAI();