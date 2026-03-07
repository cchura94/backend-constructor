const cloudProvider = require("./whatsappCloudProvider.js");
const evolutionProvider = require("./whatsappEvolutionProvider");

const provider = process.env.WHATSAPP_PROVIDER || 'cloud'; // cambiar desde la BD

function getWhatsappProvider(){
    switch (provider) {
        case "cloud":
            return cloudProvider;
        case "evolution":
            return evolutionProvider

        default:
            throw new Error("Proveedor de Whatsapp no soportado")
    }

}

module.exports = getWhatsappProvider();