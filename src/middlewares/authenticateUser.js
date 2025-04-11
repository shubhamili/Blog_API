import passport from "passport";

// middlewares/authenticateUser.js
export const authenticateUser = (req, res, next) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: "Something went wrong", error: err });
        }
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        req.user = user;
        next();
    })(req, res, next);
};
