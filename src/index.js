const express = require("express");
require("dotenv").config(); // .env
const routes = require("./routes/index.js")

// Inicializar express
const app = express();

// declarar variables
const PORT= process.env.PORT || 3000;
// Middleware
app.use(express.json());

// habilitando rutas
app.get("/saludo", function(req, res){
    console.log("Hola " + req.query.nombre +" saludos a: "+req.query.pais);
    res.json("Hola " + req.query.nombre +" saludos a: "+req.query.pais);
});

app.use("/api", routes);

app.listen(PORT, function(){
    console.log("Servidor corriendo en el puerto: "+PORT);
});