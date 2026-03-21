import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await userModel.findOne({ googleId: profile.id });

        if (!user) {
          // Check if email already registered normally
          user = await userModel.findOne({ email: profile.emails[0].value });

          if (user) {
            // Link Google ID to existing account
            user.googleId = profile.id;
            user.image = user.image || profile.photos[0]?.value;
            await user.save();
          } else {
            // Create brand new user via Google
            user = await userModel.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              image: profile.photos[0]?.value,
              phone: `google_${profile.id}`,
              password: null,
            });
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;