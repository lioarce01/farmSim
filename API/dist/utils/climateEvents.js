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
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyClimateEffectToAllFarms = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const applyClimateEffectToAllFarms = (event) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const farms = yield prisma.farm.findMany({
        include: {
            slots: true, // Obtiene todos los slots de cada granja
        },
    });
    for (const farm of farms) {
        for (const slot of farm.slots) {
            let newClimateEffect = (_a = slot.climateEffect) !== null && _a !== void 0 ? _a : 0;
            // Ajuste de tokens generados según el tipo de evento
            let newTokensGenerated = (_b = slot.seedTokensGenerated) !== null && _b !== void 0 ? _b : 0;
            switch (event.type) {
                case client_1.ClimateEventType.DROUGHT:
                    newClimateEffect -= event.intensity;
                    if (newClimateEffect < 0)
                        newClimateEffect = 0;
                    newTokensGenerated -= event.intensity;
                    if (newTokensGenerated < 0)
                        newTokensGenerated = 0;
                    break;
                case client_1.ClimateEventType.RAIN:
                    newClimateEffect += event.intensity;
                    if (newClimateEffect > 100)
                        newClimateEffect = 100;
                    newTokensGenerated += event.intensity;
                    break;
                case client_1.ClimateEventType.SNOW:
                    // Lógica para la nieve
                    break;
                case client_1.ClimateEventType.SUNNY:
                    // Lógica para clima soleado
                    break;
            }
            // Actualiza el slot en la base de datos
            yield prisma.slot.update({
                where: { id: slot.id },
                data: {
                    climateEffect: newClimateEffect,
                    seedTokensGenerated: newTokensGenerated,
                },
            });
        }
    }
});
exports.applyClimateEffectToAllFarms = applyClimateEffectToAllFarms;
