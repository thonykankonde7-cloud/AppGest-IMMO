require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');

const { Server } = require('socket.io');

// ================= APP =================
const app = express();

// ================= MIDDLEWARE =================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================= ROUTES =================
const usersRoute = require('./routes/users');
const agenciesRoute = require('./routes/agencies');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const apartmentsRoutes = require('./routes/apartments');
const tenantsRoutes = require('./routes/tenants');
const paymentsRoutes = require('./routes/payments');
const billRoutes = require('./routes/bill');
const expensesRoutes = require('./routes/expenses');
const documentsRoutes = require('./routes/documents');
const notificationsRoutes = require('./routes/notifications');
const subscriptionRoutes =require('./routes/subscriptions');
const saasSettingsRoutes =require('./routes/saasSettings');
const saasWalletRoutes =require('./routes/saasWallet.routes');
const buildingsRoutes =require('./routes/buildings');


// mount routes
app.use('/auth', authRoutes);
app.use('/users', usersRoute);
app.use('/agencies', agenciesRoute);
app.use('/dashboard', dashboardRoutes);

app.use('/buildings', buildingsRoutes);
app.use('/apartments', apartmentsRoutes);
app.use('/tenants', tenantsRoutes);

app.use('/bill', billRoutes);
app.use('/payments', paymentsRoutes);
app.use('/expenses', expensesRoutes);

app.use('/documents', documentsRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/subscriptions',subscriptionRoutes);
app.use('/saas-settings',saasSettingsRoutes);
app.use('/saas',saasWalletRoutes);



// ================= CREATE HTTP SERVER =================
const server = http.createServer(app);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// global access
global.io = io;

// ================= SOCKET LOGIC =================
io.on('connection', (socket) => {

  console.log("🟢 Client connecté:", socket.id);

  // 👤 user room
  socket.on('join_user', (user_id) => {
    socket.join(`user_${user_id}`);
  });

  // 🏢 agency room
  socket.on('join_agency', (agency_id) => {
    socket.join(`agency_${agency_id}`);
  });

  socket.on('disconnect', () => {
    console.log("🔴 Client déconnecté:", socket.id);
  });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).json({
    message: "Route introuvable"
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    application: "SaaS Immeuble",
    version: "1.0.0",
    message: "Backend actif 🚀"
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

module.exports = app;