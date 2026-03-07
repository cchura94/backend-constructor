const { ChatbotNode, Option } = require("./../models")

const chatbotController = {
    getAllNodes: async (req, res) => {
        try {
            const {botId} = req.query;

            if(!botId){
                return res.status(400).json({error: "El BotId es requerido"});
            }

            const nodos = await ChatbotNode.findAll({
                where: {botId: botId},
                include: [{model: Option, as: 'opciones'}]
            });

            return res.json(nodos);
            
        } catch (error) {
            console.log("Error en el Servidor", error);
            return res.status(500).json({error: error.message})
        }
    },
    createNode: async (req, res) => {
        try {
            const nodo = await ChatbotNode.create(req.body);
            return res.status(201).json(nodo);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    },
    createOption: async (req, res) => {
        try {
            const option = await Option.create(req.body);
            return res.status(201).json(option);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    },
    updateOption: async (req, res) => {
        try {
            const {id} = req.params;
            await Option.update(req.body, {where: {id}});
            return res.status(201).json({message: 'Option actualizada'});
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    },

    updateNode: async (req, res) => {
        try {
            const node = await ChatbotNode.update(req.body, {where: {id: req.params.id}});
            return res.status(200).json(node);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    },
    deleteNode: async (req, res) => {
        try {
            await ChatbotNode.destroy({where: {id: req.params.id}});
            return res.status(204);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    },
    deleteOption: async (req, res) => {
        try {
            await Option.destroy({where: {id: req.params.id}});
            return res.status(204);
        } catch (error) {
            return res.status(400).json({error: error.message});
        }
    },
    


}

module.exports = chatbotController;