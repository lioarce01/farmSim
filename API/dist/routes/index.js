"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./users"));
const store_1 = __importDefault(require("./store"));
const seeds_1 = __importDefault(require("./seeds"));
const router = express_1.default.Router();
router.use('/users', users_1.default);
router.use('/store', store_1.default);
router.use('/seeds', seeds_1.default);
exports.default = router;
