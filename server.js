require("dotenv").config();
const cors = require("cors");
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());

const PORT = 3000;
app.listen(PORT, () => {
  console.log("server running");
});

// Cache for USD to INR
let cachedInrRate = null;
let inrRateFetchedDate = null;

// Cache for Gold Rate
let cachedGoldRate = null;
let goldRateFetchedDate = null;

app.get("/api/usd-to-inr", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  if (inrRateFetchedDate === today && cachedInrRate !== null) {
    return res.json({ rate: cachedInrRate, source: "cache" });
  }
  try {
    const url = `https://api.currencyapi.com/v3/latest?apikey=${process.env.CURRENCY_API_KEY}&base_currency=USD&currencies=INR`;

    const response = await fetch(url);
    const data = await response.json();
    const rate = data.data.INR.value;
    const roundedRate = rate.toFixed(2);

    cachedInrRate = roundedRate;
    inrRateFetchedDate = today;

    res.json({ rate: roundedRate, source: "fresh" });
  } catch (error) {
    console.error("Error fetching USD to INR:", error);
    res.status(500).json({ error: "failed to fetch exchange rate" });
  }
});

app.get("/api/gold-rate", async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  if (goldRateFetchedDate === today && cachedGoldRate !== null) {
    return res.json({ rate: cachedGoldRate, source: "cache" });
  }
  try {
    const url = "https://www.goldapi.io/api/XAU/INR";
    console.log("Fetching from:", url);
    const response = await fetch(url, {
      headers: {
        "x-access-token": process.env.GOLD_API_KEY,
        "content-type": "application/json",
      },
    });

    const data = await response.json();
    const price = data.price;
    const pricePerGram = price / 31.1035;
    const pricePer10Gram = pricePerGram * 10;

    if (!pricePer10Gram) {
      throw new Error("Gold price not available in API respons");
    }
    const roundedPrice = pricePer10Gram.toFixed(2);

    cachedGoldRate = roundedPrice;
    goldRateFetchedDate = today;

    res.json({ rate: roundedPrice, source: "fresh" });
  } catch (error) {
    console.error("Error fetching gold rate:", error);
    res.status(500).json({ error: "Failed to fetch gold rate" });
  }
});
