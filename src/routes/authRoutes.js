const express = require("express");
const { passport } = require("../config/passport");
const authController = require("../controllers/authController");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  authController.loginSuccess
);

router.get("/status", authController.status);
router.post("/logout", authController.logout);

module.exports = router;
