import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config();

const opts = {
    // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // or use from cookies if preferred
    jwtFromRequest: (req) => req.cookies.token,

    secretOrKey: process.env.JWT_SECRET
    ,
};

export const configurePassport = (passport) => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {

            try {
                const user = await User.findById(jwt_payload.id).select('-password');
                if (user) {
                    return done(null, user); // attach user to req.user
                } else {
                    return done(null, false); // no user found
                }
            } catch (err) {
                return done(err, false);
            }
        })
    );
};
