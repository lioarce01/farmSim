import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

const authMiddleware = (jwt({
    secret: jwksRsa.expressJwtSecret({
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    algorithms: ['RS256'],
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  })
);

export default authMiddleware;