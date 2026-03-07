const axios = require("axios");

const baseUrl = process.env.EVOLUTION_API_URL; 
const instance = process.env.EVOLUTION_INSTANCE;
const apiKey = process.env.EVOLUTION_API_KEY;

const headers = {
    "Content-Type": "application/json",
    "apikey": apiKey
}

async function sendMessage(number, messageData) {
    try {
        const { url, payload } = buildPayload(number, messageData);
        const respuesta = await axios.post(url, payload, { headers });
        return respuesta.data;
        
    } catch (error) {
        console.error("❌ Error enviando mensaje:", {
            type: messageData?.type,
            number,
            error: JSON.stringify(error.response?.data) || JSON.stringify(error.message),
          });
      
      return null;
    }
}

function buildPayload(number, data) {
    switch (data.type) {
      case "text":
        return {
          url: `${baseUrl}/message/sendText/${instance}`,
          payload: {
            number,
            text: data.body,
          },
        };
      case "image":
        return {
            url: `${baseUrl}/message/sendMedia/${instance}`,
            payload: {
              number,
              mediatype: "image",
              media: data.link,
              caption: data.caption || "",
            },
          };
          case "document":
            console.log("DOC: ************************: ", data);
            return {
              url: `${baseUrl}/message/sendMedia/${instance}`,
              payload: {
                number,
                mediatype: "document",
                mimetype: "application/pdf",
                media: data.link,
                fileName: data.filename+".pdf",
                caption: data.caption || "",
              },
            };
      
          case "video":
            return {
              url: `${baseUrl}/message/sendMedia/${instance}`,
              payload: {
                number,
                mediatype: "video",
                media: data.link,
                fileName: data.filename,
                caption: data.caption || "",
              },
            };
          case "audio":
            return {
              url: `${baseUrl}/message/sendWhatsAppAudio/${instance}`,
              payload: {
                number,
                audio: data.link,
                delay: 1000,
                encoding: true,
              },
            };
      
          case "location":
            return {
              url: `${baseUrl}/message/sendLocation/${instance}`,
              payload: {
                number,
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                name: data.name,
                address: data.address,
              },
            };
            default:
                throw new Error(`Tipo de mensaje no soportado: ${data.type}`);
    }
}


function safeUrl(url) {
    return typeof url === "string" ? encodeURI(url) : url;
}

module.exports = {
    sendMessage
}