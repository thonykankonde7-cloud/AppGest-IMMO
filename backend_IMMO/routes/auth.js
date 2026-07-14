require('dotenv').config();

const express = require('express');
const router = express.Router();
const connection = require('../connection');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const { sendNotification } = require('../services/notificationService');
const { logAction } = require('../services/auditLog');

console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);


// ================= HELPER =================
function queryAsync(sql, values = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


// ================= MAIL =================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});


// ================= SIGNUP =================
router.post('/signup', async (req, res) => {

    const { fullname, email, phone, password, agency_id } = req.body;

    if (!fullname || !email || !password || !agency_id) {
        return res.status(400).json({ message: "Champs manquants" });
    }

    try {
        const exist = await queryAsync(
            "SELECT id FROM users WHERE email=?",
            [email]
        );

        if (exist.length > 0) {
            return res.status(400).json({ message: "Email déjà utilisé" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await queryAsync(
            `INSERT INTO users 
            (agency_id, fullname, email, phone, password, role, status)
            VALUES (?, ?, ?, ?, ?, 'tenant', 'active')`,
            [agency_id, fullname, email, phone, hashed]
        );

        return res.status(201).json({ message: "Utilisateur créé avec succès" });

    } catch (err) {
        return res.status(500).json(err);
    }
});

// ================= LOGIN =================
router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {
        const users = await queryAsync(
            "SELECT id, email, password, role, status, agency_id FROM users WHERE email=?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: "Utilisateur introuvable" });
        }

        const user = users[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ message: "Compte non actif" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                agency_id: user.agency_id
            },
            process.env.ACCESS_TOKEN,
            { expiresIn: '8h' }
        );

        // 🔔 Notification seulement si agence existe
        if (user.agency_id) {
            sendNotification({
                agency_id: user.agency_id,
                user_id: user.id,
                message: `Connexion de ${user.email}`,
                type: 'info',
                action_type: 'LOGIN'
            });
        }

        // 🔥 Audit
        logAction({
            user_id: user.id,
            agency_id: user.agency_id ?? null,
            action: 'LOGIN',
            entity: 'users',
            entity_id: user.id,
            description: `Connexion utilisateur ${user.email}`,
            req
        });

        return res.json({ token, user });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});


// ================= GOOGLE LOGIN =================
router.post('/google-login', async (req, res) => {

    try {

        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Token Google manquant"
            });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(401).json({
                message: "Token Google invalide"
            });
        }

        const email = payload.email;
        const fullname = payload.name;
        const avatar = payload.picture;
        const google_id = payload.sub;

        let users = await queryAsync(
            "SELECT * FROM users WHERE email=?",
            [email]
        );

        let user;

        if (users.length === 0) {

            const result = await queryAsync(
                `INSERT INTO users 
                (fullname, email, google_id, avatar, auth_provider, role, status, agency_id)
                VALUES (?, ?, ?, ?, 'google', 'tenant', 'active', NULL)`,
                [fullname, email, google_id, avatar]
            );

            user = {
                id: result.insertId,
                email,
                role: 'tenant',
                agency_id: null
            };

        } else {
            user = users[0];
        }

        const jwtToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                agency_id: user.agency_id
            },
            process.env.ACCESS_TOKEN,
            { expiresIn: '8h' }
        );

        return res.json({
            token: jwtToken,
            user
        });

    } catch (error) {
        console.error("GOOGLE LOGIN ERROR:", error);

        return res.status(401).json({
            message: "Google login failed"
        });
    }
});


// ================= FORGOT PASSWORD =================
router.post('/forgotPassword', async (req, res) => {

    const { email } = req.body;

    try {
        const users = await queryAsync(
            "SELECT id FROM users WHERE email=?",
            [email]
        );

        if (users.length === 0) {
            return res.json({
                message: "Si cet email existe, un lien a été envoyé"
            });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expire = new Date(Date.now() + 3600000);

        await queryAsync(
            `UPDATE users 
             SET password_reset_token=?, password_reset_expires=? 
             WHERE email=?`,
            [token, expire, email]
        );

        const resetLink = `http://localhost:4200/reset-password/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Réinitialisation mot de passe",
            html: `<a href="${resetLink}">Réinitialiser</a>`
        });

        return res.json({ message: "Lien envoyé" });

    } catch (err) {
        return res.status(500).json(err);
    }
});


// ================= RESET PASSWORD =================
router.post('/resetPassword', async (req, res) => {

    const { token, password } = req.body;

    try {
        const users = await queryAsync(
            `SELECT id FROM users 
             WHERE password_reset_token=? 
             AND password_reset_expires > NOW()`,
            [token]
        );

        if (users.length === 0) {
            return res.status(400).json({ message: "Lien invalide ou expiré" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await queryAsync(
            `UPDATE users 
             SET password=?, password_reset_token=NULL, password_reset_expires=NULL
             WHERE id=?`,
            [hashed, users[0].id]
        );

        return res.json({ message: "Mot de passe mis à jour" });

    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;