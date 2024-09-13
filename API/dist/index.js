"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./routes/index"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(body_parser_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use((0, cors_1.default)());
app.use('/', index_1.default);
exports.default = app;
