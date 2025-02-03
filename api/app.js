const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const middlewares = require('./middlewares');

const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

const client = new MongoClient('mongodb+srv://bfanvei:Lolitofernandez10@cluster0.3swo1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
let coleccionUsuarios;

async function conectarBBDD() {
  try {
    await client.connect();
    const db = client.db('vercel_actividad8');
    coleccionUsuarios = db.collection('usuarios');
    console.log('Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
}
conectarBBDD();

app.get("/api/users", async (req, res) => {
  try {
    const users = await coleccionUsuarios.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuarios" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const user = await coleccionUsuarios.findOne({ id: userId });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuario" });
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
