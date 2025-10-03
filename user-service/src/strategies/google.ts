import passport from "passport";
import { prisma } from "../db/prisma";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";

passport.serializeUser((user: any, done) => {
    done(null, user.google_id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { google_id: id } });
        done(null, user || null);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    scope: ['profile', 'email']
}, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    // NOTE: can use access and refresh tokens if we need to make Google API calls on behalf of user
    try {
        let user = await prisma.user.findUnique({ where: { google_id: profile._json.sub } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    google_id: profile._json.sub,
                    displayName: profile._json.name,
                    firstName: profile._json.given_name,
                    lastName: profile._json.family_name,
                    picture: profile._json.picture,
                    email: profile._json.email,
                    lastLogin: new Date()
                }
            });
            console.log(`New user created: ${user.displayName} (${user.email})`);
        } else {
            user = await prisma.user.update({
                where: { google_id: profile._json.sub },
                data: { lastLogin: new Date() }
            });
            console.log(`User logged in: ${user.displayName} (${user.email})`);
        }
        return done(null, user);
    } catch (error) {
        return done(error, undefined);
    }
}));
