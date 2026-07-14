const express = require('express');
const router = express.Router();
const connection = require('../connection');

const { authenticateToken } = require('../services/authentification');
const { checkPermission } = require('../services/permissions');
const { logAction } = require('../services/auditLog');
const { sendNotification } = require('../services/notificationService');


// ================= HELPER =================
function queryAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


// ================= CREATE BUILDING =================
router.post(
    '/create',
    authenticateToken,
    checkPermission('buildings.create'),
    async (req, res) => {

        const { name, address, total_floors, description } = req.body;
        const agency_id = res.locals.agency_id;

        if (!name || !address) {
            return res.status(400).json({
                message: "Nom et adresse requis"
            });
        }

        try {

            const result = await queryAsync(
                `INSERT INTO buildings
                (agency_id, name, address, total_floors, description)
                VALUES (?, ?, ?, ?, ?)`,
                [agency_id, name, address, total_floors || 0, description || null]
            );

            // 🔥 LOG
            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'CREATE_BUILDING',
                entity: 'buildings',
                entity_id: result.insertId,
                description: `Création immeuble ${name}`,
                req
            });

            // 🔔 NOTIF
            sendNotification({
                agency_id,
                message: `Nouvel immeuble ajouté: ${name}`,
                type: 'success'
            });

            return res.status(201).json({
                message: "Immeuble créé",
                id: result.insertId
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= GET ALL BUILDINGS =================
router.get(
    '/',
    authenticateToken,
    checkPermission('buildings.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            const buildings = await queryAsync(
                `SELECT 
                    b.*,
                    (SELECT COUNT(*) FROM apartments a WHERE a.building_id = b.id) AS total_apartments
                 FROM buildings b
                 WHERE b.agency_id=?
                 ORDER BY b.created_at DESC`,
                [agency_id]
            );

            return res.json(buildings);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= GET ONE BUILDING =================
router.get(
    '/:id',
    authenticateToken,
    checkPermission('buildings.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;
        const id = req.params.id;

        try {

            const building = await queryAsync(
                `SELECT * FROM buildings WHERE id=? AND agency_id=?`,
                [id, agency_id]
            );

            if (building.length === 0) {
                return res.status(404).json({
                    message: "Immeuble introuvable"
                });
            }

            const stats = await queryAsync(`
                SELECT
                    (SELECT COUNT(*) FROM apartments WHERE building_id=?) AS total_apartments,
                    (SELECT COUNT(*) FROM tenants t
                        JOIN apartments a ON t.apartment_id=a.id
                        WHERE a.building_id=?) AS total_tenants,
                    (SELECT COALESCE(SUM(amount_paid),0)
                        FROM payments p
                        JOIN apartments a ON p.apartment_id=a.id
                        WHERE a.building_id=? AND p.status='completed') AS total_income
            `, [id, id, id]);

            return res.json({
                building: building[0],
                stats: stats[0]
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= UPDATE BUILDING =================
router.patch(
    '/update',
    authenticateToken,
    checkPermission('buildings.update'),
    async (req, res) => {

        const { id, name, address, total_floors, description } = req.body;
        const agency_id = res.locals.agency_id;

        try {

            const existing = await queryAsync(
                "SELECT id FROM buildings WHERE id=? AND agency_id=?",
                [id, agency_id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Immeuble introuvable"
                });
            }

            await queryAsync(
                `UPDATE buildings
                 SET name=?, address=?, total_floors=?, description=?
                 WHERE id=? AND agency_id=?`,
                [name, address, total_floors, description, id, agency_id]
            );

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'UPDATE_BUILDING',
                entity: 'buildings',
                entity_id: id,
                description: `Modification immeuble ${name}`,
                req
            });

            return res.json({
                message: "Immeuble mis à jour"
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= DELETE BUILDING =================
router.delete(
    '/:id',
    authenticateToken,
    checkPermission('buildings.delete'),
    async (req, res) => {

        const id = req.params.id;
        const agency_id = res.locals.agency_id;

        try {

            const existing = await queryAsync(
                "SELECT name FROM buildings WHERE id=? AND agency_id=?",
                [id, agency_id]
            );

            if (existing.length === 0) {
                return res.status(404).json({
                    message: "Immeuble introuvable"
                });
            }

            await queryAsync(
                "DELETE FROM buildings WHERE id=? AND agency_id=?",
                [id, agency_id]
            );

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'DELETE_BUILDING',
                entity: 'buildings',
                entity_id: id,
                description: `Suppression immeuble ${existing[0].name}`,
                req
            });

            sendNotification({
                agency_id,
                message: `Immeuble supprimé: ${existing[0].name}`,
                type: 'warning'
            });

            return res.json({
                message: "Immeuble supprimé"
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);

module.exports = router;