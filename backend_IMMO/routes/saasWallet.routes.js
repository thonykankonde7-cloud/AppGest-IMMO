const express = require('express');
const router = express.Router();
const connection = require('../connection');

const { authenticateToken } = require('../services/authentification');
const { checkPermission } = require('../services/permissions');

function queryAsync(sql, values = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

router.get(
    '/wallet',
    authenticateToken,
    checkPermission('saas.read'),
  
    async (req, res) => {
      try {
  
        // TOTAL REVENUE
        const revenue = await queryAsync(`
          SELECT SUM(amount) AS total
          FROM subscription_payments
          WHERE status = 'completed'
        `);
  
        // TOTAL WITHDRAWN
        const withdrawn = await queryAsync(`
          SELECT SUM(amount) AS total
          FROM saas_withdrawals
          WHERE status = 'approved'
        `);
  
        const totalRevenue = Number(revenue[0]?.total || 0);
        const totalWithdrawn = Number(withdrawn[0]?.total || 0);
  
        const balance = totalRevenue - totalWithdrawn;
  
        return res.json({
          revenue: totalRevenue,
          withdrawn: totalWithdrawn,
          balance
        });
  
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          message: 'Erreur wallet SaaS'
        });
      }
    }
  );

  router.post(
    '/withdraw',
    authenticateToken,
    checkPermission('saas.withdraw'),
  
    async (req, res) => {
  
      const {
        amount,
        method,
        note,
        phone_number
      } = req.body;
  
      try {
  
        const revenue =
          await queryAsync(`
            SELECT SUM(amount) AS total
            FROM subscription_payments
            WHERE status='completed'
          `);
  
        const withdrawn =
          await queryAsync(`
            SELECT SUM(amount) AS total
            FROM saas_withdrawals
            WHERE status='approved'
          `);
  
        const balance =
          Number(revenue[0]?.total || 0)
          -
          Number(withdrawn[0]?.total || 0);
  
        if (amount > balance) {
  
          return res.status(400)
          .json({
            message:
              'Solde insuffisant'
          });
        }
  
        await queryAsync(`
          INSERT INTO saas_withdrawals
          (
            amount,
            method,
            phone_number,
            status,
            requested_by,
            note
          )
          VALUES
          (?, ?, ?, 'pending', ?, ?)
        `, [
          amount,
          method,
          phone_number || null,
          res.locals.id || null,
          note || null
        ]);
  
        return res.json({
          message:
            'Demande envoyée'
        });
  
      } catch (error) {
  
        console.error(error);
  
        return res.status(500)
        .json({
          message:
            'Erreur retrait'
        });
      }
    }
  );

  router.get(
    '/withdrawals',
    authenticateToken,
    checkPermission('saas.read'),
  
    async (req, res) => {
  
      try {
  
        const data = await queryAsync(`
          SELECT *
          FROM saas_withdrawals
          ORDER BY id DESC
        `);
  
        return res.json({
          withdrawals: data
        });
  
      } catch (error) {
        console.error(error);
  
        return res.status(500).json({
          message: 'Erreur chargement retraits'
        });
      }
    }
  );

  router.patch(
    '/withdrawals/:id',
    authenticateToken,
    checkPermission('saas.update'),
  
    async (req, res) => {
  
      const { status } = req.body;
      const id = req.params.id;
  
      try {
  
        await queryAsync(`
          UPDATE saas_withdrawals
          SET status = ?
          WHERE id = ?
        `, [status, id]);
  
        return res.json({
          message: 'Statut mis à jour'
        });
  
      } catch (error) {
        console.error(error);
  
        return res.status(500).json({
          message: 'Erreur update retrait'
        });
      }
    }
  );

  module.exports = router;