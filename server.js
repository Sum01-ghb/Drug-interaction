import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Missing API Key. Please set API_KEY in .env file.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

app.use(cors());
app.use(express.json());

app.get("/list-models", async (req, res) => {
  try {
    const models = [
      { name: "gemini-pro", description: "AI model for text-based tasks." },
      { name: "gemini-pro-vision", description: "AI model for text + images." },
      { name: "gemini-1.5-pro", description: "Advanced text-based AI model." },
    ];
    res.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error.message);
    res.status(500).json({ error: "Failed to fetch model list." });
  }
});

app.get("/interactions", async (req, res) => {
  const { drug } = req.query;
  if (!drug)
    return res.status(400).json({ error: "Please provide a drug name" });

  try {
    const response = await axios.get(
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(
        drug
      )}"&limit=1`
    );

    if (!response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ message: "No data found for this drug" });
    }

    const warnings = response.data.results[0].warnings || [
      "No warnings available",
    ];
    res.json({ drug, warnings });
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res
      .status(500)
      .json({ error: "Failed to fetch data. Please try again later" });
  }
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
    });

    //console.log("AI Response:", response);
    //console.log("Full AI Response:", JSON.stringify(response, null, 2));

    const reply =
      response?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI.";

    res.json({ reply });
  } catch (error) {
    console.error("Error with AI chatbot:", error);
    res.status(500).json({
      error: "Failed to process chat request",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("API Key Loaded:", process.env.API_KEY ? "Yes" : "No");
