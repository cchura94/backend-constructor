const { DataTypes } = require('sequelize');
const sequelize = require("./../config/database.js");

const Option = sequelize.define(
  'Option',
  {
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    respuesta: {
      type: DataTypes.JSON,
      allowNull: true
    },
    next_node_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'ChatbotNodes',
            key: 'id'
        }
    }
  }
);

module.exports = Option;

