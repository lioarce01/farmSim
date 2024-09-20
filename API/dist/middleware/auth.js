"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_jwt_1 = require("express-jwt");
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const authMiddleware = (0, express_jwt_1.expressjwt)({
    secret: jwks_rsa_1.default.expressJwtSecret({
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    }),
    algorithms: ['RS256'],
    audience: process.env.AUTH0_AUDIENCE,
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
});
// Luego, en tu app, puedes hacer un log
app.use((req, res, next) => {
    console.log(req.user); // Aquí deberías ver el usuario si todo está bien
    next();
});
exports.default = authMiddleware;
