const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/spreadsheets'
    ],
    accessType: 'offline',
    prompt: 'consent'
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ oauth_id: profile.id, oauth_provider: 'google' });

            if (user) {
                // Update tokens
                user.google_access_token = accessToken;
                if (refreshToken) {
                    user.google_refresh_token = refreshToken;
                }
                user.profile_image = profile.photos?.[0]?.value || user.profile_image;
                await user.save();
                return done(null, user);
            }

            // Create new user
            user = await User.create({
                name: profile.displayName,
                email: profile.emails?.[0]?.value,
                oauth_provider: 'google',
                oauth_id: profile.id,
                profile_image: profile.photos?.[0]?.value,
                google_access_token: accessToken,
                google_refresh_token: refreshToken,
                subscription_tier: 'FREE'
            });

            done(null, user);
        } catch (error) {
            done(error, null);
        }
    }
));

module.exports = passport;
