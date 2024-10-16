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
const fs = require('fs');
const path = require('path');
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
// Modificar uploadSeedImages para usar estas funciones
function uploadSeedImages() {
    return __awaiter(this, void 0, void 0, function* () {
        const existingUrls = readUrlsFromFile();
        const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
        const localImagePaths = {
            COMMON: path.join(__dirname, '../public/assets/commonPlant.png'),
            UNCOMMON: path.join(__dirname, '../public/assets/uncommonPlant.png'),
            RARE: path.join(__dirname, '../public/assets/rarePlant.png'),
            EPIC: path.join(__dirname, '../public/assets/epicPlant.png'),
            LEGENDARY: path.join(__dirname, '../public/assets/legendaryPlant.png'),
        };
        const cloudinaryUrls = {}; // Aquí almacenamos las URLs generadas
        for (const rarity of rarities) {
            if (existingUrls[rarity]) {
                console.log(`${rarity} image already exists: ${existingUrls[rarity]}`);
                cloudinaryUrls[rarity] = existingUrls[rarity];
                continue; // Salta a la siguiente rareza
            }
            const imagePath = localImagePaths[rarity];
            try {
                const imageUrl = yield uploadImageToCloudinary(imagePath);
                cloudinaryUrls[rarity] = imageUrl;
                console.log(`${rarity} image uploaded: ${imageUrl}`);
            }
            catch (error) {
                console.error(`Error uploading ${rarity} image:`, error);
            }
        }
        console.log('Todas las imágenes fueron subidas a Cloudinary:', cloudinaryUrls);
        saveUrlsToFile(cloudinaryUrls); // Guarda las nuevas URLs
        return cloudinaryUrls; // Devuelve las URLs generadas
    });
}
uploadSeedImages();
