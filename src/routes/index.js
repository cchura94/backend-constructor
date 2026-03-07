const express = require("express");

const whatsappController = require("./../controllers/whatsappController");
const chatbotController = require("../controllers/chatbotController");
const botController = require("../controllers/botController");

const router = express.Router();

router.post("/enviar-mensaje", whatsappController.enviarMensaje);

const verify_token = process.env.WHATSAPP_VERIFY_TOKEN;

router.post("/webhook", whatsappController.recibirMensajeWebhook)

router.get("/webhook", function (req, res){
    const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token':token } = req.query;
    if(mode === 'subscribe' && token === verify_token){
        console.log("WEBHOOK VERIFICADO...");
        return res.status(200).send(challenge);
    }else{
        return res.status(403).end();
    }
});


router.post("/webhook-evolution", whatsappController.recibirMensajeWebhookEvolution);

// RUTAS PARA EL CONTRUCTOR (REACT)
router.get("/chatbot/nodes", chatbotController.getAllNodes);
router.post("/chatbot/nodes", chatbotController.createNode);
router.put("/chatbot/nodes/:id", chatbotController.updateNode);
router.delete("/chatbot/nodes/:id", chatbotController.deleteNode);
// opciones
router.post("/chatbot/options", chatbotController.createOption);
router.put("/chatbot/options/:id", chatbotController.updateOption);
router.delete("/chatbot/options/:id", chatbotController.deleteOption);

// bot
router.get("/bots", botController.getAll);
router.post("/bots", botController.create);
router.delete("/bots", botController.delete);

module.exports = router;