const rateRepository = require("../db/rateRepository");

const getMe = async (req, res) => {
  const latestRates = await rateRepository.getLatestUserRates(req.user.id);
  res.json({ user: req.user, latestRates });
};

const saveRates = async (req, res) => {
  const { usdInrRate, goldRate } = req.body;
  if (!usdInrRate || !goldRate) {
    return res.status(400).json({ error: "usdInrRate and goldRate are required" });
  }
  await rateRepository.saveUserRates({
    userId: req.user.id,
    usdInrRate,
    goldRate,
  });
  return res.status(201).json({ message: "rates saved" });
};

module.exports = { getMe, saveRates };
