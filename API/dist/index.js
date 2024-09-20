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
const auth_1 = __importDefault(require("./middleware/auth"));
require("types/express");
const app = (0, express_1.default)();
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use((0, cors_1.default)());
app.use('/', index_1.default);
app.get('/test', (req, res) => {
    res.send('server running');
});
app.get('/api/auth/me', auth_1.default, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({
        id: req.user.id,
        username: req.user.username,
        inventory: req.user.inventory,
        balanceToken: req.user.balanceToken
    });
});
exports.default = app;
