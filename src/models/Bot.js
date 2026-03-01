const { DataTypes } = require('sequelize');
const sequelize = require("./../config/database.js");

const Bot = sequelize.define(
  'Bot',
  {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    number: { // ????????
        type: DataTypes.STRING(20),
        allowNull: false
    },
    plataforma: {
      type: DataTypes.ENUM('cloud', 'evolution'),
      defaultValue: 'cloud'
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Activo',
    },
    mensajes: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
  },
  {
    timestamps: true
  },
);

Bot.afterCreate(async (bot, options) => {
    const ChatbotNode = sequelize.models.ChatbotNode;
    await ChatbotNode.create({
        node_key: 'main',
        mensaje: `Hola, bienvenido a ${bot.name}`,
        botId: bot.id
    })
})

module.exports = Bot;