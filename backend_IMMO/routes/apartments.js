const express = require('express');
const router = express.Router();
const connection = require('../connection');

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

/////////////////////////////////////////////////////////
// ================= CREATE APARTMENT =================
router.post('/create',
    authenticateToken,
    checkPermission('apartments.create'),
    async (req, res) => {

        const {
            building_id,
            number,
            floor,
            type,
            status,
            rooms,
            rent,
            charges,
            description
        } = req.body;

        const agency_id = res.locals.agency_id;

        if (!building_id || !number || !rent) {
            return res.status(400).json({ message: "Champs requis" });
        }

        try {

            const building = await queryAsync(
                "SELECT id FROM buildings WHERE id=? AND agency_id=?",
                [building_id, agency_id]
            );

            if (building.length === 0) {
                return res.status(404).json({ message: "Immeuble introuvable" });
            }

            const result = await queryAsync(
                `INSERT INTO apartments
                (agency_id, building_id, number, floor, type, status, rooms, rent, charges, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    agency_id,
                    building_id,
                    number,
                    floor,
                    type,
                    status || 'available',
                    rooms,
                    rent,
                    charges || 0,
                    description
                ]
            );

            sendNotification({
                agency_id,
                message: `Appartement ${number} créé`,
                type: 'success'
            });

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'CREATE_APARTMENT',
                entity: 'apartments',
                entity_id: result.insertId,
                description: `Création appartement ${number}`,
                req
            });

            res.status(201).json({ message: "Appartement créé" });

        } catch (err) {
            console.error(err);
            res.status(500).json(err);
        }
    });

/////////////////////////////////////////////////////////
// ================= GET ALL =================
router.get('/',
    authenticateToken,
    checkPermission('apartments.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {
            const apartments = await queryAsync(`
                SELECT a.*, b.name as building_name
                FROM apartments a
                JOIN buildings b ON b.id = a.building_id
                WHERE a.agency_id=?
                ORDER BY a.created_at DESC
            `, [agency_id]);

            res.json(apartments);

        } catch (err) {
            res.status(500).json(err);
        }
    });

/////////////////////////////////////////////////////////
// ================= GET BY BUILDING =================
router.get('/building/:id',
    authenticateToken,
    checkPermission('apartments.read'),
    async (req, res) => {

        const building_id = req.params.id;
        const agency_id = res.locals.agency_id;

        try {
            const apartments = await queryAsync(
                `SELECT * FROM apartments 
                 WHERE building_id=? AND agency_id=?`,
                [building_id, agency_id]
            );

            res.json(apartments);

        } catch (err) {
            res.status(500).json(err);
        }
    });

/////////////////////////////////////////////////////////
// ================= UPDATE =================
router.patch('/update',
    authenticateToken,
    checkPermission('apartments.update'),
    async (req, res) => {

        const {
            id,
            number,
            floor,
            type,
            status,
            rooms,
            rent,
            charges,
            description
        } = req.body;

        const agency_id = res.locals.agency_id;

        try {

            const result = await queryAsync(
                `UPDATE apartments 
                 SET number=?, floor=?, type=?, status=?, rooms=?, rent=?, charges=?, description=?
                 WHERE id=? AND agency_id=?`,
                [
                    number,
                    floor,
                    type,
                    status,
                    rooms,
                    rent,
                    charges,
                    description,
                    id,
                    agency_id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Appartement introuvable" });
            }

            res.json({ message: "Appartement mis à jour" });

        } catch (err) {
            res.status(500).json(err);
        }
    });

/////////////////////////////////////////////////////////
// ================= DELETE =================
router.delete(
    '/delete/:id',
    authenticateToken,
    checkPermission('apartments.delete'),
    async (req, res) => {
  
      const id = req.params.id;
      const agency_id = res.locals.agency_id;
  
      try {
  
        // Vérifier l'appartement
        const apartments = await queryAsync(
          `
          SELECT id, number, status
          FROM apartments
          WHERE id = ?
            AND agency_id = ?
          `,
          [id, agency_id]
        );
  
        if (apartments.length === 0) {
          return res.status(404).json({
            message: 'Appartement introuvable'
          });
        }
  
        const apartment = apartments[0];
  
        // Bloquer si occupé
        if (apartment.status === 'occupied') {
          return res.status(400).json({
            message: `Impossible de supprimer l'appartement ${apartment.number} car il est occupé`
          });
        }
  
        await queryAsync(
          `
          DELETE FROM apartments
          WHERE id = ?
            AND agency_id = ?
          `,
          [id, agency_id]
        );
  
        logAction({
          user_id: res.locals.id,
          agency_id,
          action: 'DELETE_APARTMENT',
          entity: 'apartments',
          entity_id: id,
          description: `Suppression appartement ${apartment.number}`,
          req
        });
  
        sendNotification({
          agency_id,
          message: `Appartement ${apartment.number} supprimé`,
          type: 'warning'
        });
  
        res.json({
          message: 'Appartement supprimé avec succès'
        });
  
      } catch (err) {
        console.error(err);
        res.status(500).json(err);
      }
    }
  );

    /////////////////////////////////////////////////////////
// ================= AVAILABLE APARTMENTS =================
router.get(
    '/available',
    authenticateToken,
    checkPermission('apartments.read'),
    async (req, res) => {
  
      const agency_id = res.locals.agency_id;
  
      try {
  
        const apartments = await queryAsync(`
          SELECT
            a.id,
            a.number,
            b.name AS building
          FROM apartments a
          JOIN buildings b
            ON b.id = a.building_id
          WHERE a.agency_id = ?
            AND a.status = 'available'
          ORDER BY a.number
        `, [agency_id]);
  
        res.json(apartments);
  
      } catch (err) {
        console.error(err);
        res.status(500).json(err);
      }
    }
  );

module.exports = router;