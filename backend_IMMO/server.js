require('dotenv').config();

const http = require('http');
const app = require('./index');
const { Server } = require('socket.io');

// 🔥 créer serveur HTTP
const server = http.createServer(app);

// 🔥 config Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
  }
});

// 🔥 rendre io global (pour notifications, logs, etc.)
global.io = io;

// 🔥 connexion client
io.on('connection', (socket) => {
  console.log('🟢 Client connecté:', socket.id);

  // 🔥 rejoindre un utilisateur spécifique
  socket.on('join_user', (user_id) => {
    socket.join(`user_${user_id}`);
    console.log(`👤 user_${user_id} connecté à sa room`);
  });

  // 🔥 rejoindre une agence
  socket.on('join_agency', (agency_id) => {
    socket.join(`agency_${agency_id}`);
    console.log(`🏢 agency_${agency_id} connecté à sa room`);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client déconnecté:', socket.id);
  });
});

// 🔥 PORT
const PORT = process.env.PORT || 8080;

// 🔥 lancer serveur
server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});