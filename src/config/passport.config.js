import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./db.config.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar_url = profile.photos?.[0]?.value;

        const existing = await pool.query(
          "SELECT * FROM users WHERE google_id = $1",
          [googleId],
        );

        if (existing.rows.length > 0) {
          const user = existing.rows[0];
          if (user.is_deleted) {
            return done(null, false, {
              message: "ACCOUNT_DELETED",
              deletedAt: user.deleted_at,
              email: user.email,
            });
          }
          return done(null, user);
        }

        const result = await pool.query(
          `INSERT INTO users (google_id, email, name, avatar_url)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [googleId, email, name, avatar_url],
        );

        return done(null, result.rows[0]);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

export default passport;
