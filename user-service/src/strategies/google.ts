import passport from "passport";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";

const users = new Map<string, any>();

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
    const user = users.get(id);
    done(null, user || null);
});

passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    scope: ['profile', 'email']
}, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
        let user = users.get(profile.id);

        if (!user) {
            // Create new user
            user = {
                id: profile.id,
                email: profile.emails?.[0]?.value,
                name: profile.displayName,
                picture: profile.photos?.[0]?.value,
                accessToken,
                refreshToken,
                createdAt: new Date(),
                lastLogin: new Date()
            };

            users.set(profile.id, user);
            console.log(`New user created: ${user.name} (${user.email})`);
        } else {
            // Update last login
            user.lastLogin = new Date();
            user.accessToken = accessToken;
            user.refreshToken = refreshToken;
            console.log(`User logged in: ${user.name} (${user.email})`);
        }

        return done(null, user);
    } catch (error) {
        return done(error, undefined);
    }
}));
