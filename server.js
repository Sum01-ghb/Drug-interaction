import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const openai = new OpenAI(process.env.OPENAI_API_KEY);

app.use(cors());
app.use(express.json());

app.get("/interactions", async (req, res) => {
  const { drug } = req.query;
  if (!drug) {
    return res.status(400).json({ error: "Please provide a drug name" });
  }

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
    console.error("Error fetching data", error);
    res
      .status(500)
      .json({ error: "Failed to fetch data. Please try again later" });
  }
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(
      "Error with AI chatbot:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to process chat request" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
