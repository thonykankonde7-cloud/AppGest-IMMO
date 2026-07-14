require('dotenv').config();
const jwt = require('jsonwebtoken');

function authenticateToken(
  req,
  res,
  next
) {

  try {

    const authHeader =
      req.headers.authorization;

    const token =
      authHeader &&
      authHeader.split(' ')[1];

    console.log(
      'TOKEN =>',
      token
    );

    if (!token) {
      return res.status(401).json({
        message: 'Token manquant'
      });
    }

    jwt.verify(
      token,
      process.env.ACCESS_TOKEN,
      (err, user) => {

        if (err) {

          console.log(
            'JWT ERROR =>',
            err
          );

          return res.status(403).json({
            message:
              'Token invalide ou expiré'
          });
        }

        console.log(
          'USER =>',
          user
        );

        // IMPORTANT
        res.locals.id =
          user.id;

        res.locals.user_id =
          user.id;

        res.locals.email =
          user.email;

        res.locals.role =
          user.role;

        res.locals.agency_id =
          user.agency_id;

        next();
      }
    );

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      message:
        'Erreur authentification'
    });
  }
}

module.exports = {
  authenticateToken
};