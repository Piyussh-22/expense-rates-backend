const express = require("express");
const userController = require("../controllers/userController");
const { ensureAuth } = require("../middleware/ensureAuth");

const router = express.Router();

router.get("/me", ensureAuth, userController.getMe);
router.post("/rates", ensureAuth, userController.saveRates);

module.exports = router;
