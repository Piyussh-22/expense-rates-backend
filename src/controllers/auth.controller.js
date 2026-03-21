import jwt from "jsonwebtoken";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const handleGoogleCallback = (req, res) => {
  const user = req.user;

  if (!user) {
    return res.redirect(
      `${process.env.CLIENT_URL}/login?error=account_deleted`,
    );
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
      default_currency: user.default_currency,
      currency_set: user.currency_set,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
  );

  res.cookie("token", token, COOKIE_OPTIONS);
  const redirectTo = user.currency_set ? "/dashboard" : "/setup";
  res.redirect(`${process.env.CLIENT_URL}${redirectTo}`);
};

export const getMe = (req, res) => {
  res.json({ user: req.user });
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully." });
};
