const axios = require("axios");
const whatsappService = require("./../services/whatsappService")
const { UserContext, ChatbotNode, Option } =  require("./../models");
const { where } = require("sequelize");

async function enviarMensaje(req, res){
    try {
        const { numero, mensaje } = req.body;

        if(!numero || !mensaje){
            return res.status(400).json({success: false, error: "Debes enviar un numero y un mensaje"});
        }

        // procesar el mensaje
        const response = await whatsappService.enviarMensajeWhatsapp(numero, mensaje)
    
        return res.status(200).json({success: true, data: response});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, error: error.message});
    } 
}

const preguntas = [
    "Hola, ¿Cuál es su Nombre?",
    "¿Cual es tu correo?",
    "¿Cual es tu número de identificación?",
];

const sesiones = {}

async function recibirMensajeWebhook(req, res){

    // console.log(JSON.stringify(req.body, null, 2));
    try {
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if(!value?.messages){
            return res.status(200).send("No Mensaje");
        }

        const message = value.messages[0];
        const numero = message.from;
        
        if(message.type === "text"){
            mensajeUsuario = message.text.body;
        }
        if(message.type === "interactive"){
            if(message.interactive.type == "button_reply"){
                mensajeUsuario = message.interactive.button_reply.id;
            }
        }

        console.log("*** : RESPUESTA USUARIO: "+mensajeUsuario);

        // 1. Buscar o crear el conext del usuario
        let [ context, created ] = await UserContext.findOrCreate({
            where: {phone_number: numero},
            defaults: {current_node: 'main'}
        });

        if(created) {
            await enviarMensajeDinamico(numero, 'main');
            // await enviarMensajeDinamicoButtons(numero, 'main');
    
            return res.sendStatus(200);
        }

       
        const nodeData = await ChatbotNode.findOne({
            where: {
                node_key: context.current_node
            }
        });
        

        const opcion = await Option.findOne({
            where: {
                chatbotNodeId: nodeData.id,
                key: mensajeUsuario
            }
        });

        if(!opcion){
            
            if(!sesiones[numero]){
                sesiones[numero] = {
                    paso: 0,
                    respuestas: []
                }
                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body: preguntas[0]
                });

                console.log(sesiones[numero])
                return res.sendStatus(200);
            }
            const sesion = sesiones[numero];
            sesion.respuestas.push(mensajeUsuario);
            sesion.paso++;
            if(sesion.paso >= preguntas.length){
                const datos = {
                    nombre: sesion.respuestas[0],
                    correo: sesion.respuestas[1],
                    identificacion: sesion.respuestas[2],
                }
                console.log(datos);
                let mensajeRespuestaDatos = ` Los datos ingresados son: \n\n*Nombre*:${sesion.respuestas[0]}\n*Correo*:${sesion.respuestas[1]}\n*Nro. Identificación*:${sesion.respuestas[2]}` 
                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body: mensajeRespuestaDatos
                });
                await whatsappService.enviarMensajeWhatsapp(numero, {
                    type: "text",
                    body: "Gracias, registramos tus datos."
                });
                
                //delete sesiones[numero];
                return res.sendStatus(200);
            }

            await whatsappService.enviarMensajeWhatsapp(numero, {
                type: "text",
                body: preguntas[sesion.paso]
            });

            console.log(sesiones[numero])
            return res.sendStatus(200);
        }

        if(opcion.respuesta){
            await whatsappService.enviarMensajeWhatsapp(numero, opcion.respuesta)
        }

        if(opcion.next_node_id){

            const nodeData2 = await ChatbotNode.findOne({
                where: {
                    id: opcion.next_node_id
                }
            });

            await context.update({current_node: nodeData2.node_key});
            await enviarMensajeDinamico(numero, nodeData2.node_key);
            // await enviarMensajeDinamicoButtons(numero, nodeData2.node_key);
        }
        // const response = await whatsappService.enviarMensajeWhatsapp(numero, {type: "text", body: mensajeUsuario})
                
        return res.sendStatus(200);
    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }    
}

async function recibirMensajeWebhookEvolution(req, res){
    try {

        const body = req.body;

        if(body.event !== "messages.upsert"){
            return res.sendStatus(200);
        }

        const data = body.data;

        // ignorar mensajes enviados por el bot
        if(data.key.fromMe){
            return res.sendStatus(200);
        }

        // numero usuario
        const numero = data.key.remoteJid.split("@")[0];

        let mensajeUsuario = "";

        // texto normal
        if(data.message?.conversation){
            mensajeUsuario = data.message.conversation;
        }

        // otros tipos posibles
        if(data.message?.extendedTextMessage){
            mensajeUsuario = data.message.extendedTextMessage.text;
        }

        if(!mensajeUsuario){
            return res.sendStatus(200);
        }

        console.log("*** : RESPUESTA USUARIO:", mensajeUsuario);

        // 1. Buscar o crear contexto
        let [ context, created ] = await UserContext.findOrCreate({
            where: { phone_number: numero },
            defaults: { current_node: 'main' }
        });

        if(created){
            await enviarMensajeDinamico(numero, 'main');
            return res.sendStatus(200);
        }

        const nodeData = await ChatbotNode.findOne({
            where: { node_key: context.current_node }
        });

        const opcion = await Option.findOne({
            where: {
                chatbotNodeId: nodeData.id,
                key: mensajeUsuario
            }
        });

        if(!opcion){

            if(!sesiones[numero]){
                sesiones[numero] = {
                    paso: 0,
                    respuestas: []
                }

                await whatsappService.enviarMensajeWhatsapp(numero,{
                    type: "text",
                    body: preguntas[0]
                });

                return res.sendStatus(200);
            }

            const sesion = sesiones[numero];

            sesion.respuestas.push(mensajeUsuario);
            sesion.paso++;

            if(sesion.paso >= preguntas.length){

                const datos = {
                    nombre: sesion.respuestas[0],
                    correo: sesion.respuestas[1],
                    identificacion: sesion.respuestas[2],
                }

                console.log(datos);

                let mensajeRespuestaDatos = `Los datos ingresados son:\n\n*Nombre*: ${datos.nombre}\n*Correo*: ${datos.correo}\n*Nro. Identificación*: ${datos.identificacion}`;

                await whatsappService.enviarMensajeWhatsapp(numero,{
                    type:"text",
                    body:mensajeRespuestaDatos
                });

                await whatsappService.enviarMensajeWhatsapp(numero,{
                    type:"text",
                    body:"Gracias, registramos tus datos."
                });

                return res.sendStatus(200);
            }

            await whatsappService.enviarMensajeWhatsapp(numero,{
                type:"text",
                body: preguntas[sesion.paso]
            });

            return res.sendStatus(200);
        }

        if(opcion.respuesta){
            await whatsappService.enviarMensajeWhatsapp(numero, opcion.respuesta);
        }

        if(opcion.next_node_id){

            const nodeData2 = await ChatbotNode.findOne({
                where:{ id: opcion.next_node_id }
            });

            await context.update({
                current_node: nodeData2.node_key
            });

            await enviarMensajeDinamico(numero, nodeData2.node_key);
        }

        return res.sendStatus(200);

    } catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}

async function enviarMensajeDinamico(numero, nodeId){
    // 1. Buscr el Nodo y sus opciones de la BD
    const nodo = await ChatbotNode.findOne({
        where: {node_key: nodeId},
        include: [{model: Option, as: 'opciones'}]
    });

    if(!nodo){
        console.log(`Nodo ${nodeId} no encontrado`);
        return;
    }

    // 2. Construir el cuerpo del mensaje con la lista de opciones
    const opcionesTexto = nodo.opciones.map(opt => `- 👉*${opt.key}*: ${opt.text}`).join("\n");
    const mensajeFinal = `${nodo.mensaje}\n\n${opcionesTexto}\n\n> *Indícanos una opción*`

    // 3. enviar el mensaje
     await whatsappService.enviarMensajeWhatsapp(numero, {type: "text", body: mensajeFinal})
 
    return;
}

async function enviarMensajeDinamicoButtons(numero, nodeId){
    // 1. Buscr el Nodo y sus opciones de la BD
    const nodo = await ChatbotNode.findOne({
        where: {node_key: nodeId},
        include: [{model: Option, as: 'opciones'}]
    });

    if(!nodo){
        console.log(`Nodo ${nodeId} no encontrado`);
        return;
    }

    // 2. Construir el cuerpo del mensaje con la lista de opciones

    const buttons = nodo.opciones.map(opt => ({
                                type: "reply",
                                reply: {
                                    id: opt.key,
                                    title: opt.text
                                }}));
    // 3. enviar el mensaje
     await whatsappService.enviarMensajeWhatsapp(numero, {type: "buttons", body: nodo.mensaje, buttons})
 
    return;
}

module.exports = {
    enviarMensaje,
    recibirMensajeWebhook,
    recibirMensajeWebhookEvolution
}