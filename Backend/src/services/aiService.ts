import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function getAIResponse(prompt: string) {
  try {
    console.log("🔹 Sending prompt to Gemini:", prompt);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(url, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("⚠️ Gemini returned empty content:", response.data);
      return "No response from Gemini";
    }

    return text;
  } catch (error: any) {
    console.error("❌ Gemini API Error:", error.response?.data || error.message);
    return "AI service unavailable";
  }
}
