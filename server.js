import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
