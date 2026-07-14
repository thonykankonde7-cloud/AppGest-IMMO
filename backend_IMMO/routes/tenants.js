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
// ================= ASSIGN TENANT =================
router.post(
  '/assign',
  authenticateToken,
  checkPermission('tenants.create'),
  async (req, res) => {

    const agency_id = res.locals.agency_id;

    let {
      fullname,
      phone,
      email,
      address,
      id_card,
      apartment_id,
      contract_start,
      contract_end,
      rent,
      deposit,
      status,
      notes
    } = req.body;

    if (!fullname || !apartment_id) {
      return res.status(400).json({
        message: 'Nom complet et appartement obligatoires'
      });
    }

    contract_start = contract_start
      ? new Date(contract_start).toISOString().split('T')[0]
      : null;

    contract_end = contract_end
      ? new Date(contract_end).toISOString().split('T')[0]
      : null;

    console.log({
      contract_start,
      contract_end
    });

    // suite du code...

    console.log({
      contract_start,
      contract_end
    });
  
      try {
  
        // Vérifier appartement
        const apartments = await queryAsync(
          `
          SELECT status
          FROM apartments
          WHERE id = ? AND agency_id = ?
          `,
          [apartment_id, agency_id]
        );
  
        if (apartments.length === 0) {
          return res.status(404).json({
            message: 'Appartement introuvable'
          });
        }
  
        if (apartments[0].status === 'occupied') {
          return res.status(400).json({
            message: 'Appartement déjà occupé'
          });
        }

        const existingTenant = await queryAsync(
          `
          SELECT id
          FROM tenants
          WHERE apartment_id = ?
            AND status = 'active'
            AND agency_id = ?
          `,
          [apartment_id, agency_id]
        );
        
        if (existingTenant.length > 0) {
          return res.status(400).json({
            message: 'Cet appartement possède déjà un locataire actif'
          });
        }
  
        // Créer locataire
        const result = await queryAsync(
          `
          INSERT INTO tenants (
            agency_id,
            fullname,
            phone,
            email,
            address,
            id_card,
            apartment_id,
            contract_start,
            contract_end,
            rent,
            deposit,
            status,
            notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            agency_id,
            fullname,
            phone || null,
            email || null,
            address || null,
            id_card || null,
            apartment_id,
            contract_start || null,
            contract_end || null,
            rent || 0,
            deposit || 0,
            status || 'active',
            notes || null
          ]
        );
  
        // Mettre l'appartement en occupé
        await queryAsync(
          `
          UPDATE apartments
          SET status = 'occupied'
          WHERE id = ?
            AND agency_id = ?
          `,
          [apartment_id, agency_id]
        );
  
        sendNotification({
          agency_id,
          message: `Appartement attribué à ${fullname}`,
          type: 'success'
        });
  
        logAction({
          user_id: res.locals.id,
          agency_id,
          action: 'ASSIGN_TENANT',
          entity: 'tenants',
          entity_id: result.insertId,
          description: `Assignation du locataire ${fullname}`,
          req
        });
  
        res.status(201).json({
          message: 'Locataire créé avec succès'
        });
  
      } catch (err) {
        console.error(err);
        res.status(500).json(err);
      }
    }
  );

/////////////////////////////////////////////////////////
// ================= GET TENANTS =================
router.get('/',
    authenticateToken,
    checkPermission('tenants.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {
            const tenants = await queryAsync(`
                SELECT t.*, a.number, b.name as building
                FROM tenants t
                JOIN apartments a ON a.id = t.apartment_id
                JOIN buildings b ON b.id = a.building_id
                WHERE t.agency_id=?
                ORDER BY t.created_at DESC
            `, [agency_id]);

            res.json(tenants);

        } catch (err) {
            res.status(500).json(err);
        }
    });

/////////////////////////////////////////////////////////
// ================= REMOVE TENANT =================
router.delete('/remove/:id',
    authenticateToken,
    checkPermission('tenants.delete'),
    async (req, res) => {

        const tenant_id = req.params.id;
        const agency_id = res.locals.agency_id;

        try {

            const tenants = await queryAsync(
                "SELECT apartment_id, fullname FROM tenants WHERE id=? AND agency_id=?",
                [tenant_id, agency_id]
            );

            if (tenants.length === 0) {
                return res.status(404).json({ message: "Locataire introuvable" });
            }

            const tenant = tenants[0];

            // 🔥 DELETE TENANT
            await queryAsync(
                "DELETE FROM tenants WHERE id=?",
                [tenant_id]
            );

            // 🔥 LIBÉRER APPARTEMENT
            await queryAsync(
              `
              UPDATE apartments
              SET status='available'
              WHERE id=?
                AND agency_id=?
              `,
              [tenant.apartment_id, agency_id]
            );

            // 🔔 NOTIF
            sendNotification({
                agency_id,
                message: `Locataire ${tenant.fullname} retiré`,
                type: 'warning'
            });

            // 🔥 LOG
            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'REMOVE_TENANT',
                entity: 'tenants',
                entity_id: tenant_id,
                description: `Retrait locataire ${tenant.fullname}`,
                req
            });

            res.json({ message: "Locataire supprimé" });

        } catch (err) {
            res.status(500).json(err);
        }
    });

    router.put(
      '/:id',
      authenticateToken,
      checkPermission('tenants.update'),
      async (req, res) => {
    
        const tenant_id = req.params.id;
        const agency_id = res.locals.agency_id;
    
        let {
          fullname,
          phone,
          email,
          address,
          id_card,
          contract_start,
          contract_end,
          rent,
          deposit,
          status,
          notes
        } = req.body;
    
        contract_start = contract_start
          ? new Date(contract_start).toISOString().split('T')[0]
          : null;
    
        contract_end = contract_end
          ? new Date(contract_end).toISOString().split('T')[0]
          : null;
    
        try {
    
          // récupérer l'appartement lié au locataire
          const tenantData = await queryAsync(
            `
            SELECT apartment_id
            FROM tenants
            WHERE id = ?
              AND agency_id = ?
            `,
            [tenant_id, agency_id]
          );
    
          if (tenantData.length === 0) {
            return res.status(404).json({
              message: 'Locataire introuvable'
            });
          }
    
          const apartmentId = tenantData[0].apartment_id;
    
          // modifier locataire
          await queryAsync(
            `
            UPDATE tenants
            SET
              fullname = ?,
              phone = ?,
              email = ?,
              address = ?,
              id_card = ?,
              contract_start = ?,
              contract_end = ?,
              rent = ?,
              deposit = ?,
              status = ?,
              notes = ?
            WHERE id = ?
              AND agency_id = ?
            `,
            [
              fullname,
              phone || null,
              email || null,
              address || null,
              id_card || null,
              contract_start,
              contract_end,
              rent || 0,
              deposit || 0,
              status,
              notes || null,
              tenant_id,
              agency_id
            ]
          );
    
          // mettre à jour le statut de l'appartement
          const apartmentStatus =
            status === 'active'
              ? 'occupied'
              : 'available';
    
          await queryAsync(
            `
            UPDATE apartments
            SET status = ?
            WHERE id = ?
              AND agency_id = ?
            `,
            [
              apartmentStatus,
              apartmentId,
              agency_id
            ]
          );
    
          // notification
          sendNotification({
            agency_id,
            message: `Locataire ${fullname} modifié`,
            type: 'info'
          });
    
          // audit
          logAction({
            user_id: res.locals.id,
            agency_id,
            action: 'UPDATE_TENANT',
            entity: 'tenants',
            entity_id: tenant_id,
            description: `Modification du locataire ${fullname}`,
            req
          });
    
          res.json({
            message: 'Locataire modifié avec succès'
          });
    
        } catch (err) {
          console.error(err);
          res.status(500).json(err);
        }
      }
    );

module.exports = router;