const whatsappProvider = require("./providers");

async function enviarMensajeWhatsapp(numero, mensaje) {
    return await whatsappProvider.sendMessage(numero, mensaje);  
}

module.exports = {
    enviarMensajeWhatsapp
}