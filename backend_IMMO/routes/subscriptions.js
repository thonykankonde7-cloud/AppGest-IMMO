const express = require('express');
const router = express.Router();
const connection = require('../connection');

const {
  authenticateToken
} = require('../services/authentification');

const {
  checkPermission
} = require('../services/permissions');

const {
  logAction
} = require('../services/auditLog');


// ======================================================
// MYSQL PROMISE
// ======================================================
function queryAsync(sql, values = []) {
  return new Promise((resolve, reject) => {
    connection.query(
      sql,
      values,
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
}


// ======================================================
// GET ALL PLANS + PAYMENTS + STATS
// ======================================================
router.get(
  '/plans',
  authenticateToken,
  checkPermission('saas.read'),

  async (req, res) => {

    try {

      // ==========================
      // PLANS
      // ==========================
      const plansRaw = await queryAsync(`
      SELECT *
      FROM subscription_plans
      ORDER BY id DESC
    `);
    
    const plans = plansRaw.map(p => ({
      id: p.id,
      name: p.name.toUpperCase(),
      description: p.description,
      price: Number(p.price),
    
      max_buildings: p.max_buildings,
      max_apartments: p.max_apartments,
      max_users: p.max_users,
    
      support_type: p.support_type,
      is_active: p.is_active,
    
      // 🔥 AJOUT FRONTEND FRIENDLY
      features: [
        `${p.max_buildings} immeubles`,
        `${p.max_apartments} appartements`,
        `${p.max_users} utilisateurs`,
        `Support ${p.support_type}`
      ]
    }));

      // ==========================
      // REVENUE
      // ==========================
      const revenue =
        await queryAsync(`
          SELECT
            IFNULL(SUM(amount),0)
            AS total
          FROM subscription_payments
          WHERE status='completed'
        `);

      // ==========================
      // ACTIVE SUBSCRIPTIONS
      // ==========================
      const activeSubscriptions =
        await queryAsync(`
          SELECT COUNT(*) AS total
          FROM subscription_payments
          WHERE status='completed'
          AND end_date >= CURDATE()
        `);

      // ==========================
      // EXPIRED SUBSCRIPTIONS
      // ==========================
      const expiredSubscriptions =
        await queryAsync(`
          SELECT COUNT(*) AS total
          FROM subscription_payments
          WHERE status='completed'
          AND end_date < CURDATE()
        `);

      // ==========================
      // PENDING PAYMENTS
      // ==========================
      const pendingPayments =
        await queryAsync(`
          SELECT COUNT(*) AS total
          FROM subscription_payments
          WHERE status='pending'
        `);

      // ==========================
      // ACTIVE AGENCIES
      // ==========================
      const activeAgencies =
        await queryAsync(`
          SELECT COUNT(*) AS total
          FROM (
            SELECT agency_id
            FROM subscription_payments
            WHERE status='completed'
            AND end_date >= CURDATE()
            GROUP BY agency_id
          ) AS t
        `);

      // ==========================
      // AGENCY PAYMENTS LIST
      // ==========================
      const agencySubscriptions =
        await queryAsync(`
          SELECT
            s.id,
            s.amount,
            s.payment_method,
            s.phone_number,
            s.transaction_id,
            s.status,
            s.payment_date,
            s.start_date,
            s.end_date,

            a.id AS agency_id,
            a.name AS agency_name,
            a.phone AS agency_phone,

            p.id AS plan_id,
            p.name AS plan_name,
            p.price AS plan_price

          FROM subscription_payments s

          INNER JOIN agencies a
            ON a.id = s.agency_id

          INNER JOIN subscription_plans p
            ON p.id = s.plan_id

          ORDER BY s.id DESC
        `);

      // ==========================
      // ACTIVE PLANS
      // ==========================
      const activePlans =
        plans.filter(
          p => p.is_active === 1
        ).length;

      // ==========================
      // RESPONSE
      // ==========================
      return res.json({
        plans,

        revenue:
          Number(
            revenue[0]?.total
          ) || 0,

        activePlans,

        activeAgencies:
          activeAgencies[0]
            ?.total || 0,

        activeSubscriptions:
          activeSubscriptions[0]
            ?.total || 0,

        expiredSubscriptions:
          expiredSubscriptions[0]
            ?.total || 0,

        pendingPayments:
          pendingPayments[0]
            ?.total || 0,

        agencySubscriptions
      });

    } catch (error) {

      console.error(error);

      return res.status(500).json({
        message:
          'Erreur chargement SaaS'
      });
    }
  }
);


      // ==========================
      // CREATE PAYMENT
      // ==========================
router.post(
  '/payment/create',
  authenticateToken,
  async (req, res) => {

    try {

      const {
        plan,
        method,
        phone,
        reference,
        amount
      } = req.body;

      // récupérer plan
      const planData = await queryAsync(
        `SELECT id FROM subscription_plans WHERE name=?`,
        [plan]
      );

      if (!planData.length) {
        return res.status(400).json({
          message: 'Plan invalide'
        });
      }

      await queryAsync(`
        INSERT INTO subscription_payments (
          agency_id,
          plan_id,
          amount,
          payment_method,
          phone_number,
          transaction_id,
          status,
          payment_date,
          start_date,
          end_date
        )
        VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NULL, NULL)
      `, [
        req.user.agency_id,
        planData[0].id,
        amount,
        method,
        phone,
        reference
      ]);

      return res.json({
        message: 'Paiement soumis en attente'
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Erreur création paiement'
      });
    }
  }
);


// ======================================================
// VALIDATE PAYMENT
// ======================================================
router.patch(
  '/payment/approve/:id',
  authenticateToken,
  checkPermission('saas.update'),

  async (req, res) => {

    try {

      const paymentId =
        req.params.id;

      const payment =
        await queryAsync(`
          SELECT *
          FROM subscription_payments
          WHERE id=?
        `, [paymentId]);

      if (!payment.length) {
        return res.status(404)
          .json({
            message:
              'Paiement introuvable'
          });
      }

      await queryAsync(`
        UPDATE subscription_payments
        SET status='completed'
        WHERE id=?
      `, [paymentId]);

      await logAction({
        user_id:
          res.locals.id,

        agency_id:
          null,

        action:
          'APPROVE_PAYMENT',

        entity:
          'subscription_payments',

        entity_id:
          paymentId,

        description:
          `Validation paiement abonnement ID ${paymentId}`,

        req
      });

      return res.json({
        message:
          'Paiement validé'
      });

    } catch (error) {

      console.error(error);

      return res.status(500)
        .json({
          message:
            'Erreur validation'
        });
    }
  }
);


// ======================================================
// REJECT PAYMENT
// ======================================================
router.patch(
  '/payment/reject/:id',
  authenticateToken,
  checkPermission('saas.update'),

  async (req, res) => {

    try {

      const paymentId =
        req.params.id;

      await queryAsync(`
        UPDATE subscription_payments
        SET status='rejected'
        WHERE id=?
      `, [paymentId]);

      await logAction({
        user_id:
          res.locals.id,

        agency_id:
          null,

        action:
          'REJECT_PAYMENT',

        entity:
          'subscription_payments',

        entity_id:
          paymentId,

        description:
          `Rejet paiement abonnement ID ${paymentId}`,

        req
      });

      return res.json({
        message:
          'Paiement rejeté'
      });

    } catch (error) {

      console.error(error);

      return res.status(500)
        .json({
          message:
            'Erreur rejet'
        });
    }
  }
);


// ======================================================
// CREATE PLAN
// ======================================================
router.post(
  '/create',
  authenticateToken,
  checkPermission('saas.create'),

  async (req, res) => {

    try {

      const {
        name,
        description,
        price,
        max_buildings,
        max_apartments,
        max_users,
        support_type
      } = req.body;

      const result =
        await queryAsync(`
          INSERT INTO subscription_plans (
            name,
            description,
            price,
            max_buildings,
            max_apartments,
            max_users,
            support_type
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          name,
          description || '',
          price || 0,
          max_buildings || 1,
          max_apartments || 10,
          max_users || 5,
          support_type || 'standard'
        ]);

      return res.status(201)
        .json({
          message:
            'Plan créé',
          id:
            result.insertId
        });

    } catch (error) {

      console.error(error);

      return res.status(500)
        .json({
          message:
            'Erreur création plan'
        });
    }
  }
);


// ======================================================
// UPDATE PLAN
// ======================================================
router.patch(
  '/update',
  authenticateToken,
  checkPermission('saas.update'),

  async (req, res) => {

    try {

      const {
        id,
        name,
        description,
        price,
        max_buildings,
        max_apartments,
        max_users,
        support_type
      } = req.body;

      await queryAsync(`
        UPDATE subscription_plans
        SET
          name=?,
          description=?,
          price=?,
          max_buildings=?,
          max_apartments=?,
          max_users=?,
          support_type=?
        WHERE id=?
      `, [
        name,
        description,
        price,
        max_buildings,
        max_apartments,
        max_users,
        support_type,
        id
      ]);

      return res.json({
        message:
          'Plan modifié'
      });

    } catch (error) {

      console.error(error);

      return res.status(500)
        .json({
          message:
            'Erreur update'
        });
    }
  }
);


// ======================================================
// TOGGLE PLAN
// ======================================================
router.patch(
  '/toggle',
  authenticateToken,
  checkPermission('saas.update'),

  async (req, res) => {

    try {

      const {
        id,
        active
      } = req.body;

      await queryAsync(`
        UPDATE subscription_plans
        SET is_active=?
        WHERE id=?
      `, [
        active ? 1 : 0,
        id
      ]);

      return res.json({
        message:
          'Statut modifié'
      });

    } catch (error) {

      console.error(error);

      return res.status(500)
        .json({
          message:
            'Erreur toggle'
        });
    }
  }
);


// ======================================================
// DELETE PLAN
// ======================================================
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('saas.delete'),

  async (req, res) => {

    try {

      await queryAsync(`
        DELETE FROM subscription_plans
        WHERE id=?
      `, [req.params.id]);

      return res.json({
        message:
          'Plan supprimé'
      });

    } catch (error) {

      console.error(error);

      return res.status(500)
        .json({
          message:
            'Erreur suppression'
        });
    }
  }
);

module.exports = router;