const fetch = (...args) =>
  import("node-fetch").then(({ default: fetchFn }) => fetchFn(...args));
const { config } = require("../config/env");

let cachedInrRate = null;
let inrRateFetchedDate = null;
let cachedGoldRate = null;
let goldRateFetchedDate = null;

const getUsdToInr = async () => {
  const today = new Date().toISOString().split("T")[0];
  if (inrRateFetchedDate === today && cachedInrRate !== null) {
    return { rate: cachedInrRate, source: "cache" };
  }

  const url = `https://api.currencyapi.com/v3/latest?apikey=${config.apis.currencyApiKey}&base_currency=USD&currencies=INR`;
  const response = await fetch(url);
  const data = await response.json();
  const rate = data.data.INR.value;
  const roundedRate = Number(rate).toFixed(2);

  cachedInrRate = roundedRate;
  inrRateFetchedDate = today;

  return { rate: roundedRate, source: "fresh" };
};

const getGoldRate = async () => {
  const today = new Date().toISOString().split("T")[0];
  if (goldRateFetchedDate === today && cachedGoldRate !== null) {
    return { rate: cachedGoldRate, source: "cache" };
  }

  const response = await fetch("https://www.goldapi.io/api/XAU/INR", {
    headers: {
      "x-access-token": config.apis.goldApiKey,
      "content-type": "application/json",
    },
  });

  const data = await response.json();
  const price = data.price;
  const pricePerGram = price / 31.1035;
  const pricePer10Gram = pricePerGram * 10;

  if (!pricePer10Gram) {
    throw new Error("Gold price not available in API response");
  }

  const roundedPrice = Number(pricePer10Gram).toFixed(2);
  cachedGoldRate = roundedPrice;
  goldRateFetchedDate = today;

  return { rate: roundedPrice, source: "fresh" };
};

module.exports = { getUsdToInr, getGoldRate };
