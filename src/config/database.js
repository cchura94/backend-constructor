const { Sequelize } = require("sequelize");
require("dotenv").config(); // .env

const sequelize = new Sequelize(process.env.BD_NAME, process.env.BD_USER, process.env.BD_PASSWORD, {
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect: 'postgres'
});

async function textConexion(){
    try {
        await sequelize.authenticate();
        console.log('CONEXION CON BD CORRECTA!!!.');
      } catch (error) {
        console.error('ERROR DE CONEXION CON BD:', error);
      }
}
textConexion()

module.exports = sequelize;