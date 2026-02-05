const express = require("express");
const rateController = require("../controllers/rateController");

const router = express.Router();

router.get("/usd-to-inr", rateController.getUsdToInr);
router.get("/gold-rate", rateController.getGoldRate);

module.exports = router;
