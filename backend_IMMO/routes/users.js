const express = require('express');
const router = express.Router();
const connection = require('../connection');

const bcrypt = require('bcryptjs');

const { authenticateToken } = require('../services/authentification');
const { checkPermission } = require('../services/permissions');
const { logAction } = require('../services/auditLog');
const { sendNotification } = require('../services/notificationService');


// ================= HELPER =================
function queryAsync(sql, values = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


// ================= GET USERS =================
router.get(
    '/get',
    authenticateToken,
    checkPermission('users.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {
            const users = await queryAsync(
                `SELECT id, fullname, email, phone, role, status, created_at
                 FROM users
                 WHERE agency_id=?`,
                [agency_id]
            );

            return res.json(users);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= PROFILE =================
router.get('/profile', authenticateToken, async (req, res) => {

    const user_id = res.locals.id;

    try {
        const users = await queryAsync(
            `SELECT id, fullname, email, phone, role, status, agency_id
             FROM users
             WHERE id=?`,
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        return res.json(users[0]);

    } catch (err) {
        return res.status(500).json(err);
    }
});


// ================= UPDATE USER =================
router.patch(
    '/update',
    authenticateToken,
    checkPermission('users.update'),
    async (req, res) => {

        const { id, fullname, phone, status, role } = req.body;

        const agency_id = res.locals.agency_id;
        const currentUserId = Number(res.locals.id);
        const currentUserRole = res.locals.role;

        try {

            const users = await queryAsync(
                "SELECT role FROM users WHERE id=? AND agency_id=?",
                [id, agency_id]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: "Utilisateur introuvable" });
            }

            const targetRole = users[0].role;

            // 🔒 protéger super_admin
            if (targetRole === 'super_admin' && currentUserRole !== 'super_admin') {
                return res.status(403).json({
                    message: "Accès refusé"
                });
            }

            // 🔒 empêcher modification de son propre rôle
            if (currentUserId === Number(id) && role && role !== currentUserRole) {
                return res.status(403).json({
                    message: "Vous ne pouvez pas changer votre propre rôle"
                });
            }

            // 🔒 seul super_admin peut créer admin
            if (currentUserRole !== 'super_admin' && role === 'admin') {
                return res.status(403).json({
                    message: "Seul le super admin peut attribuer le rôle admin"
                });
            }

            await queryAsync(
                `UPDATE users 
                 SET fullname=?, phone=?, status=?, role=? 
                 WHERE id=? AND agency_id=?`,
                [fullname, phone, status, role, id, agency_id]
            );

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'UPDATE_USER',
                entity: 'users',
                entity_id: id,
                description: `Modification utilisateur ID ${id}`,
                req
            });

            return res.json({ message: "Utilisateur mis à jour" });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= CHANGE PASSWORD =================
router.post('/change-password', authenticateToken, async (req, res) => {

    const { oldPassword, newPassword } = req.body;
    const user_id = res.locals.id;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Champs requis" });
    }

    try {
        const users = await queryAsync(
            "SELECT password FROM users WHERE id=?",
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable" });
        }

        const isMatch = await bcrypt.compare(oldPassword, users[0].password);

        if (!isMatch) {
            return res.status(400).json({ message: "Ancien mot de passe incorrect" });
        }

        const hashed = await bcrypt.hash(newPassword, 10);

        await queryAsync(
            "UPDATE users SET password=? WHERE id=?",
            [hashed, user_id]
        );

        return res.json({ message: "Mot de passe mis à jour" });

    } catch (err) {
        return res.status(500).json(err);
    }
});


// ================= STATUS =================
router.patch(
    '/status',
    authenticateToken,
    checkPermission('users.status'),
    async (req, res) => {

        const { id, status } = req.body;
        const agency_id = res.locals.agency_id;

        try {

            const users = await queryAsync(
                "SELECT role FROM users WHERE id=? AND agency_id=?",
                [id, agency_id]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: "Utilisateur introuvable" });
            }

            if (users[0].role === 'super_admin') {
                return res.status(403).json({
                    message: "Impossible de modifier un super admin"
                });
            }

            await queryAsync(
                `UPDATE users SET status=? WHERE id=? AND agency_id=?`,
                [status, id, agency_id]
            );

            sendNotification({
                agency_id,
                message: `Statut utilisateur modifié`,
                type: 'warning'
            });

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'UPDATE_STATUS',
                entity: 'users',
                entity_id: id,
                description: `Changement statut user ${id} → ${status}`,
                req
            });

            return res.json({ message: "Statut mis à jour" });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= CREATE USER =================
router.post(
    '/create',
    authenticateToken,
    checkPermission('users.create'),
    async (req, res) => {

        const { fullname, email, phone, password, role } = req.body;
        const agency_id = res.locals.agency_id;

        if (!fullname || !email || !password || !role) {
            return res.status(400).json({
                message: "Champs obligatoires"
            });
        }

        try {

            if (role === 'super_admin') {
                return res.status(403).json({
                    message: "Impossible de créer un super admin"
                });
            }

            if (res.locals.role !== 'super_admin' && role === 'admin') {
                return res.status(403).json({
                    message: "Seul le super admin peut créer un admin"
                });
            }

            const existing = await queryAsync(
                "SELECT id FROM users WHERE email=? AND agency_id=?",
                [email, agency_id]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    message: "Email déjà utilisé"
                });
            }

            const hashed = await bcrypt.hash(password, 10);

            const result = await queryAsync(
                `INSERT INTO users 
                (agency_id, fullname, email, phone, password, role, status)
                VALUES (?, ?, ?, ?, ?, ?, 'active')`,
                [agency_id, fullname, email, phone, hashed, role]
            );

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'CREATE_USER',
                entity: 'users',
                entity_id: result.insertId,
                description: `Création utilisateur ${fullname}`,
                req
            });

            try {
                sendNotification({
                    agency_id,
                    message: `Nouvel utilisateur créé: ${fullname}`,
                    type: 'success'
                });
            } catch (e) {
                console.log("Notification error:", e.message);
            }

            return res.status(201).json({
                message: "Utilisateur créé avec succès"
            });

        } catch (error) {
            return res.status(500).json(error);
        }
    }
);

module.exports = router;