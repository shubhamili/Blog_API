export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "You are not authorized for this action" });
        }
        next();
    };
};
