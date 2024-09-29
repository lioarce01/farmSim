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
const auth_js_1 = __importDefault(require("../middleware/auth.js"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            include: {
                inventory: {
                    include: {
                        seeds: true,
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
        res.status(500).send({ message: "Error al obtener usuarios" });
    }
}));
router.get('/:sub', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sub } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { sub },
            include: {
                inventory: {
                    include: {
                        seeds: true,
                        waters: true,
                    }
                }
            }
        });
        user ? res.status(200).send(user) : res.status(404).send({ message: "User not found." });
    }
    catch (e) {
        console.error("Error", e);
        res.status(500).json({ message: "Error" });
    }
}));
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nickname, email, sub } = req.body;
    console.log('data:', req.body);
    // Validación de entradas
    if (!email || !nickname) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    try {
        // Verificar si el usuario ya existe
        const existingUser = yield prisma.user.findUnique({ where: { sub } });
        if (existingUser) {
            return res.status(409).json({ message: 'Usuario ya existe' });
        }
        // Crear el usuario en la base de datos
        const newUser = yield prisma.user.create({
            data: {
                nickname,
                email,
                sub,
                role: 'USER',
                inventory: {
                    create: {
                        seeds: {},
                        waters: {},
                    },
                },
            },
        });
        res.status(201).json({ message: 'Usuario creado exitosamente', newUser });
    }
    catch (error) {
        const e = error;
        console.error("Error al crear usuario:", e.message);
        return res.status(500).json({ message: 'error al crear usuario', error: e.message });
    }
}));
//update tokens del usuario por body
router.post('/addTokens', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userSub, tokensToAdd } = req.body;
    try {
        const user = yield prisma.user.findUnique({
            where: { sub: userSub }
        });
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        yield prisma.user.update({
            where: { sub: userSub },
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
router.put('/convert', auth_js_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sub } = req.body;
    try {
        const convertedUser = yield prisma.user.findUnique({
            where: { sub },
        });
        if ((convertedUser === null || convertedUser === void 0 ? void 0 : convertedUser.role) === 'USER') {
            yield prisma.user.update({
                where: { sub },
                data: {
                    role: 'ADMIN',
                },
            });
            return res.status(200).json({ message: 'User successfully converted to ADMIN' });
        }
        else {
            yield prisma.user.update({
                where: { sub },
                data: {
                    role: 'USER',
                },
            });
            return res.status(200).json({ message: 'User successfully converted to USER' });
        }
    }
    catch (e) {
        res.status(400).json({ message: 'Error: User cannot be converted.' });
    }
}));
router.delete('/:sub', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sub } = req.params;
    try {
        const deletedUser = yield prisma.user.delete({
            where: { sub }
        });
        deletedUser ? res.status(200).send({ message: "User deleted successfully" })
            : res.status(404).send({ message: "ID Could not be found" });
    }
    catch (e) {
        res.status(400).send({ message: 'ERROR: unexpected error' });
        console.log(e);
    }
}));
exports.default = router;
