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
    try {
        const users = yield prisma.user.findMany({
            include: {
                inventory: {
                    include: {
                        seeds: false,
                        waters: true,
                    }
                }
            }
        });
        const countingInventory = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const seedCount = yield prisma.seed.count({
                where: {
                    inventoryId: (_a = user.inventory) === null || _a === void 0 ? void 0 : _a.id, // Contar las semillas de este inventario
                },
            });
            const waterCount = yield prisma.water.count({
                where: {
                    inventoryId: (_b = user.inventory) === null || _b === void 0 ? void 0 : _b.id,
                }
            });
            // Añadir el conteo de semillas al inventario
            return Object.assign(Object.assign({}, user), { inventory: Object.assign(Object.assign({}, user.inventory), { seedCount: seedCount, waterCount: waterCount }) });
        })));
        res.json(countingInventory);
    }
    catch (e) {
        console.log(e);
        res.status(500).send({ error: "Error al obtener usuarios" });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id },
            include: {
                inventory: {
                    include: {
                        seeds: true,
                        waters: true,
                    }
                }
            }
        });
        user ? res.status(200).send(user) : res.status(404).send("ERROR: User not found.");
    }
    catch (e) {
        console.error("Error", e);
        res.status(500).json({ message: "Error" });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const newUser = yield prisma.user.create({
            data: {
                username: username,
                inventory: {
                    create: {
                        seeds: {},
                        waters: {},
                    }
                }
            },
            include: {
                inventory: {
                    include: {
                        seeds: true,
                        waters: true,
                    }
                }
            }
        });
        res.status(201).json(newUser);
    }
    catch (e) {
        console.error("Error al crear usuario:", e);
        res.status(500).json({ message: "Error al crear usuario" });
    }
}));
//update tokens del usuario por body
router.post('/addTokens', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, tokensToAdd } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        yield prisma.user.update({
            where: { id: userId },
            data: {
                balanceToken: { increment: tokensToAdd }
            }
        });
        return res.status(200).json({ message: 'Tokens agregados con exito', newBalance: user.balanceToken + tokensToAdd });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ message: "Error al agregar tokens al usuario" });
    }
}));
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedUser = yield prisma.user.delete({
            where: { id }
        });
        deletedUser ? res.status(200).send("User deleted successfully")
            : res.status(404).send("ID Could not be found");
    }
    catch (e) {
        res.status(400).send('ERROR: unexpected error');
        console.log(e);
    }
}));
exports.default = router;
