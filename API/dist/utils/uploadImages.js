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
const cloudinary = require('./cloudinary.js'); // Importa la configuración de Cloudinary
const path = require('path'); // Para manejar rutas de archivos
const fs = require('fs'); // Para manejar archivos
// Función para subir imágenes a Cloudinary
function uploadImageToCloudinary(imagePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield cloudinary.uploader.upload(imagePath, {
                folder: 'rarity-seeds', // Carpeta en la que se guardarán las imágenes en Cloudinary
            });
            return result.secure_url; // Devuelve la URL segura de Cloudinary
        }
        catch (error) {
            console.error('Error subiendo imagen a Cloudinary:', error);
            throw error;
        }
    });
}
// Leer las URLs desde un archivo JSON
function readUrlsFromFile() {
    const filePath = path.join(__dirname, 'imageUrls.json');
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    }
    return {};
}
// Guardar las URLs en un archivo JSON
function saveUrlsToFile(urls) {
    const filePath = path.join(__dirname, 'imageUrls.json');
    fs.writeFileSync(filePath, JSON.stringify(urls, null, 2));
}
function uploadSeedImages() {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUrls = readUrlsFromFile(); // Lee las URLs existentes
        const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
        const localImagePaths = {
            COMMON: path.join(__dirname, '../public/assets/commonPlant.png'),
            UNCOMMON: path.join(__dirname, '../public/assets/uncommonPlant.png'),
            RARE: path.join(__dirname, '../public/assets/rarePlant.png'),
            EPIC: path.join(__dirname, '../public/assets/epicPlant.png'),
            LEGENDARY: path.join(__dirname, '../public/assets/legendaryPlant.png'),
            WATERING_CAN: path.join(__dirname, '../public/assets/wateringCan.png'),
        };
        const cloudinaryUrls = {}; // Aquí almacenamos las URLs generadas
        // Sube las imágenes de las semillas
        for (const rarity of rarities) {
            if (existingUrls[rarity]) {
                console.log(`${rarity} image already exists: ${existingUrls[rarity]}`);
                cloudinaryUrls[rarity] = existingUrls[rarity]; // Usa la URL existente
                continue; // Salta a la siguiente rareza
            }
            const imagePath = localImagePaths[rarity];
            try {
                const imageUrl = yield uploadImageToCloudinary(imagePath); // Sube la imagen
                cloudinaryUrls[rarity] = imageUrl; // Guarda la URL generada en el objeto
                console.log(`${rarity} image uploaded: ${imageUrl}`);
            }
            catch (error) {
                console.error(`Error uploading ${rarity} image:`, error);
            }
        }
        // Sube la imagen de la regadera
        if (!existingUrls['WATERING_CAN']) {
            try {
                const wateringCanUrl = yield uploadImageToCloudinary(localImagePaths.WATERING_CAN);
                cloudinaryUrls['WATERING_CAN'] = wateringCanUrl;
                console.log(`Watering can image uploaded: ${wateringCanUrl}`);
            }
            catch (error) {
                console.error(`Error uploading watering can image:`, error);
            }
        }
        else {
            console.log(`Watering can image already exists: ${existingUrls['WATERING_CAN']}`);
            cloudinaryUrls['WATERING_CAN'] = existingUrls['WATERING_CAN'];
        }
        // Guardar URLs solo si hay nuevas
        if (Object.keys(cloudinaryUrls).length > 0) {
            saveUrlsToFile(Object.assign(Object.assign({}, existingUrls), cloudinaryUrls)); // Guarda las nuevas URLs junto con las existentes
        }
        console.log('Todas las imágenes fueron subidas a Cloudinary:', cloudinaryUrls);
        return cloudinaryUrls; // Devuelve las URLs generadas
    });
}
// Función para obtener la imagen por rareza
const getImageForRarity = (rarity) => {
    const existingUrls = readUrlsFromFile(); // Lee las URLs existentes
    return existingUrls[rarity] || existingUrls.COMMON; // Retorna la URL de la rareza o la común por defecto
};
// Exportar la función si se necesita en otros módulos
module.exports = { uploadSeedImages, getImageForRarity };
