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

//////////////////////////////////////////////////////
// 🔥 CREATE PAYMENT (FACTURE LOYER)
//////////////////////////////////////////////////////
router.post(
  '/create',
  authenticateToken,
  checkPermission('payments.create'),
  async (req, res) => {

    const { tenant_id, apartment_id, due_date } = req.body;
    const agency_id = res.locals.agency_id;

    if (!tenant_id || !apartment_id) {
      return res.status(400).json({ message: "Champs requis" });
    }

    try {

      // 🔥 récupérer le loyer du locataire
      const tenants = await queryAsync(
        "SELECT rent FROM tenants WHERE id=? AND agency_id=?",
        [tenant_id, agency_id]
      );

      if (tenants.length === 0) {
        return res.status(404).json({ message: "Locataire introuvable" });
      }

      const amount = tenants[0].rent;

      const result = await queryAsync(
        `INSERT INTO payments
        (agency_id, tenant_id, apartment_id, amount, due_date, status, amount_paid)
        VALUES (?, ?, ?, ?, ?, 'pending', 0)`,
        [agency_id, tenant_id, apartment_id, amount, due_date]
      );

      // 🔔 notif agence
      sendNotification({
        agency_id,
        message: `Nouveau paiement créé`,
        type: 'info'
      });

      // 🔥 audit
      logAction({
        user_id: res.locals.id,
        agency_id,
        action: 'CREATE_PAYMENT',
        entity: 'payments',
        entity_id: result.insertId,
        description: `Création paiement ID ${result.insertId}`,
        req
      });

      return res.status(201).json({
        message: "Paiement créé",
        id: result.insertId
      });

    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

//////////////////////////////////////////////////////
// 🔥 GET PAYMENTS
//////////////////////////////////////////////////////
router.get(
  '/',
  authenticateToken,
  checkPermission('payments.read'),
  async (req, res) => {

    const agency_id = res.locals.agency_id;

    try {

      const payments = await queryAsync(
        `SELECT p.*, t.fullname, a.number AS apartment
         FROM payments p
         LEFT JOIN tenants t ON p.tenant_id = t.id
         LEFT JOIN apartments a ON p.apartment_id = a.id
         WHERE p.agency_id=?
         ORDER BY p.created_at DESC`,
        [agency_id]
      );

      return res.json(payments);

    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

//////////////////////////////////////////////////////
// 🔥 PAY (payer un loyer)
//////////////////////////////////////////////////////
router.post(
  '/pay',
  authenticateToken,
  checkPermission('payments.pay'),
  async (req, res) => {

    const { id, amount_paid, method } = req.body;
    const agency_id = res.locals.agency_id;

    try {

      const payments = await queryAsync(
        "SELECT * FROM payments WHERE id=? AND agency_id=?",
        [id, agency_id]
      );

      if (payments.length === 0) {
        return res.status(404).json({ message: "Paiement introuvable" });
      }

      const payment = payments[0];

      const currentPaid = Number(payment.amount_paid || 0);
      const addPaid = Number(amount_paid);
      const totalAmount = Number(payment.amount);
      
      const newPaid = currentPaid + addPaid;
      
      let status = 'pending';
      
      if (newPaid >= totalAmount) {
        status = 'completed';
      } else if (newPaid > 0) {
        status = 'partial';
      }
      
      await queryAsync(
        `UPDATE payments 
         SET amount_paid=?, status=?, payment_date=NOW(), method=?
         WHERE id=?`,
        [newPaid, status, method, id]
      );

      // 🔔 notif user
      sendNotification({
        agency_id,
        message: `Paiement reçu (${amount_paid})`,
        type: 'success'
      });

      // 🔥 audit
      logAction({
        user_id: res.locals.id,
        agency_id,
        action: 'PAYMENT_DONE',
        entity: 'payments',
        entity_id: id,
        description: `Paiement ${amount_paid} effectué`,
        req
      });

      return res.json({
        message: "Paiement effectué",
        status
      });

    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

//////////////////////////////////////////////////////
// 🔥 DELETE PAYMENT
//////////////////////////////////////////////////////
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('payments.delete'),
  async (req, res) => {

    const id = req.params.id;
    const agency_id = res.locals.agency_id;

    try {

      await queryAsync(
        "DELETE FROM payments WHERE id=? AND agency_id=?",
        [id, agency_id]
      );

      logAction({
        user_id: res.locals.id,
        agency_id,
        action: 'DELETE_PAYMENT',
        entity: 'payments',
        entity_id: id,
        description: `Suppression paiement ${id}`,
        req
      });

      return res.json({ message: "Paiement supprimé" });

    } catch (err) {
      return res.status(500).json(err);
    }
  }
);

module.exports = router;