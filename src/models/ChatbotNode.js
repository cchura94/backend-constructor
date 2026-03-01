const { DataTypes } = require('sequelize');
const sequelize = require("./../config/database.js");

const ChatbotNode = sequelize.define(
  'ChatbotNode',
  {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    node_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mensaje: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tipo_mensaje: {
        type: DataTypes.STRING,
        defaultValue: 'text',
    },
    botId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Bots',
            key: 'id'
        }
    }
  },
  {
  },
);

module.exports = ChatbotNode;