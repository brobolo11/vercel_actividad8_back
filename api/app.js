const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();

const url = "mongodb+srv://bfanvei:Lolitofernandez10@cluster0.3swo1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const cliente = new MongoClient(url);
cliente.connect();
const db = cliente.db('vercel_actividad8');
const coleccion = db.collection('usuarios');

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/api/users", async (req, res) =>{
  try {
    const users = await coleccion.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
});

app.get("/api/users/:id", async (req, res) => {
  const userId = parseInt(req.params.id, 10); // Convertir a número
  if (isNaN(userId)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const user = await coleccion.findOne({ id: userId });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const { nombre, apellido, tlf } = req.body;
    if (!nombre || !apellido || !tlf) {
      return res.status(400).json({ message: "Todos los campos son requeridos: nombre, apellido, tlf" });
    }
    
    const lastUser = await coleccionUsuarios.find().sort({ id: -1 }).limit(1).toArray();
    const newId = lastUser.length > 0 ? lastUser[0].id + 1 : 1;
    
    const result = await coleccionUsuarios.insertOne({ id: newId, nombre, apellido, tlf });
    res.status(201).json({ _id: result.insertedId, id: newId, nombre, apellido, tlf });
  } catch (error) {
    res.status(500).json({ message: "Error creando usuario" });
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;