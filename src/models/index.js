const sequelize = require("./../config/database");

const ChatbotNode = require("./ChatbotNode");
const Bot = require("./Bot");
const Option = require("./Option");
const UserContext = require("./UserContext");

// Un Nodo tiene muchas opciones
ChatbotNode.hasMany(Option, {as: 'opciones', foreignKey: 'chatbotNodeId'});

// Una Opcion puede apuntar a otro Nodo
Option.belongsTo(ChatbotNode, {as: 'nextNode', foreignKey: 'next_node_id'});

const db = {
    ChatbotNode,
    Option,
    UserContext,
    sequelize
}

module.exports = db;