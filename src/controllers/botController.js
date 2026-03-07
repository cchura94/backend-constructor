const Bot = require("./../models/Bot");

module.exports = {
    getAll: async (req, res) => {
        try {
            const bots = await Bot.findAll({order: [['createdAt', 'DESC']]});
            return res.json(bots);
        } catch (error) {
            return res.status(500).json({error: error.message});            
        }
    },

    create: async (req, res) => {
        try {
            const newBot = await Bot.create(req.body);
            return res.status(201).json(newBot);
        } catch (error) {
            res.status(400).json({error: error.message})
        }
    },

    delete: async (req, res) => {
        try {
            await Bot.destroy({where: {id: req.params.id}});
            return res.status(200).json({mensaje: "Bot Elminado"});
        } catch (error) {
            res.status(400).json({error: error.message})
        }
    }
}