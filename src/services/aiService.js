const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})

async function generarRespuestaIA(mensajeUsuario, historialAnterior = [], promptSistema){
    try {
        const messages = [
            {role: "system", content: promptSistema},
            ...historialAnterior,
            {role: "user", content: mensajeUsuario }
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-5',
            messages: messages
        })

        const respuesta = completion.choices[0].message.content;

        return {
            respuesta,
            nuevoHistorial: [
                ...historialAnterior,
                {role: "user", content: mensajeUsuario},
                {role: "assistant", content: respuesta}
            ]
        }

    } catch (error) {
        console.log("Error en OpenAI Service: ", error);
        return {respuesta: "Lo siento, tuve un problema al procesar tu solicitud ", nuevoHistorial: historialAnterior};       
    }
}

module.exports = { generarRespuestaIA };
