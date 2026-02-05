const { config } = require("../config/env");

const loginSuccess = (req, res) => {
  res.redirect(`${config.clientUrl}/`);
};

const logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "logged out" });
    });
  });
};

const status = (req, res) => {
  res.json({ authenticated: req.isAuthenticated(), user: req.user || null });
};

module.exports = { loginSuccess, logout, status };
