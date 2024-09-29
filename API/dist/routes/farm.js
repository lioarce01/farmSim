"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para traer todas las farm
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para traer farm por id
}));
router.post('/plantSeed', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para plantar una semilla
}));
router.post('/waterSlot', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para regar un slot
}));
router.post('/harvestSlot', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //logica para cosechar un slot
}));
exports.default = router;
