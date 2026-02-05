const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { config } = require("./env");
const userRepository = require("../db/userRepository");

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const name = profile.displayName || "Google User";
        const avatarUrl = profile.photos?.[0]?.value || null;

        let user = await userRepository.findByGoogleId(googleId);
        if (!user) {
          const userId = await userRepository.createUser({
            googleId,
            email,
            name,
            avatarUrl,
          });
          user = await userRepository.findById(userId);
        }

        await userRepository.updateLastLogin(user.id);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = { passport };
