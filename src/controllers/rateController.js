const rateService = require("../services/rateService");

const getUsdToInr = async (req, res) => {
  try {
    const result = await rateService.getUsdToInr();
    res.json(result);
  } catch (error) {
    console.error("Error fetching USD to INR:", error);
    res.status(500).json({ error: "failed to fetch exchange rate" });
  }
};

const getGoldRate = async (req, res) => {
  try {
    const result = await rateService.getGoldRate();
    res.json(result);
  } catch (error) {
    console.error("Error fetching gold rate:", error);
    res.status(500).json({ error: "Failed to fetch gold rate" });
  }
};

module.exports = { getUsdToInr, getGoldRate };
