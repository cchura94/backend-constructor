const { DataTypes } = require('sequelize');
const sequelize = require("./../config/database.js");

const UserContext = sequelize.define(
  'UserContext',
  {
    phone_number: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    current_node: {
      type: DataTypes.STRING,
      defaultValue: "main"
    },
    ai_history: {
        type: DataTypes.JSONB,
        defaultValue: []
    },
  },
);


module.exports = UserContext;