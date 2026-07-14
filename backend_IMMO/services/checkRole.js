function checkRole(allowedRoles = []) {

    return (req, res, next) => {

        const userRole = res.locals.role;

        // ❌ pas connecté
        if (!userRole) {
            return res.status(401).json({
                message: "Non authentifié"
            });
        }

        // ❌ rôle non autorisé
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: "Accès refusé"
            });
        }

        next();
    };
}

module.exports = { checkRole };