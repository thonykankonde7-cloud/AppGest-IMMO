const express = require('express');
const router = express.Router();
const connection = require('../connection');

const { authenticateToken } = require('../services/authentification');
const { checkPermission } = require('../services/permissions');
const { logAction } = require('../services/auditLog');

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


// ================= UPLOAD DOCUMENT =================
router.post(
    '/upload',
    authenticateToken,
    checkPermission('documents.create'),
    async (req, res) => {

        const {
            title,
            file_url,
            type,
            tenant_id,
            apartment_id,
            building_id
        } = req.body;

        const agency_id = res.locals.agency_id;

        if (!title || !file_url || !type) {
            return res.status(400).json({
                message: "Champs obligatoires manquants"
            });
        }

        try {

            const result = await query(
                `INSERT INTO documents
                (agency_id, title, file_url, type, tenant_id, apartment_id, building_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    agency_id,
                    title,
                    file_url,
                    type,
                    tenant_id || null,
                    apartment_id || null,
                    building_id || null
                ]
            );

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'UPLOAD_DOCUMENT',
                entity: 'documents',
                entity_id: result.insertId,
                description: `Upload document: ${title}`,
                req
            });

            return res.status(201).json({
                message: "Document uploadé",
                document_id: result.insertId
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= GET ALL DOCUMENTS =================
router.get(
    '/',
    authenticateToken,
    checkPermission('documents.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            const docs = await query(
                `SELECT d.*,
                        t.fullname AS tenant_name,
                        b.name AS building_name
                 FROM documents d
                 LEFT JOIN tenants t ON t.id = d.tenant_id
                 LEFT JOIN buildings b ON b.id = d.building_id
                 WHERE d.agency_id=?
                 ORDER BY d.created_at DESC`,
                [agency_id]
            );

            return res.json(docs);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= GET SINGLE DOCUMENT =================
router.get(
    '/:id',
    authenticateToken,
    checkPermission('documents.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            const doc = await query(
                `SELECT * FROM documents
                 WHERE id=? AND agency_id=?`,
                [req.params.id, agency_id]
            );

            if (doc.length === 0) {
                return res.status(404).json({
                    message: "Document introuvable"
                });
            }

            return res.json(doc[0]);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= DELETE DOCUMENT =================
router.delete(
    '/:id',
    authenticateToken,
    checkPermission('documents.delete'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            const result = await query(
                `DELETE FROM documents
                 WHERE id=? AND agency_id=?`,
                [req.params.id, agency_id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Document introuvable"
                });
            }

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'DELETE_DOCUMENT',
                entity: 'documents',
                entity_id: req.params.id,
                description: `Suppression document`,
                req
            });

            return res.json({
                message: "Document supprimé"
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);

module.exports = router;
