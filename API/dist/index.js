"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const express_openid_connect_1 = require("express-openid-connect");
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use((0, cors_1.default)());
app.use('/', index_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.use((0, express_openid_connect_1.auth)({
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    baseURL: 'http://localhost:3002', // Cambia esto a la URL de tu aplicación
    clientID: process.env.AUTH0_CLIENT_ID,
    secret: process.env.AUTH0_CLIENT_SECRET,
    authRequired: false, // Establece esto a true si quieres que todas las rutas estén protegidas
    auth0Logout: true, // Habilita el logout
}));
// app.get('/api/auth/me', (req, res) => {
//   if (req.oidc.isAuthenticated()) {
//     res.json(req.oidc.user);
//   } else {
//     res.status(401).json({ error: 'Not authenticated' });
//   }
// });
app.get('/test', (req, res) => {
    res.send('server running');
});
exports.default = app;
