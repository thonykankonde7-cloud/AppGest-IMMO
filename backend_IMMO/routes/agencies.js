const express = require('express');
const router = express.Router();
const connection = require('../connection');
const bcrypt = require('bcryptjs');

const {
  authenticateToken
} = require('../services/authentification');

const {
  checkRole
} = require('../services/checkRole');

const {
  logAction
} = require('../services/auditLog');

const {
  sendNotification
} = require('../services/notificationService');

const {
  getSubscriptionState
} = require('../services/subscriptionService');

// ======================================================
// QUERY WRAPPER
// ======================================================
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}



// ======================================================
// GET ALL AGENCIES
// ======================================================
router.get(
  '/',
  authenticateToken,
  checkRole(['super_admin']),
  async (req, res) => {
    try {

      const results = await query(`
        SELECT
          a.id,
          a.name,
          a.email,
          a.phone,
          a.address,
          a.status,
          a.created_at,

          sp.name AS plan_name,

          s.status AS subscription_status,
          s.start_date,
          s.end_date,

          CASE
            WHEN s.end_date IS NULL
              THEN 'no_subscription'

            WHEN NOW()
              BETWEEN s.start_date
              AND s.end_date
              THEN 'active'

            WHEN s.end_date < NOW()
              THEN 'expired'

            ELSE 'pending'
          END AS subscription_state,

          (
            SELECT COUNT(*)
            FROM users u
            WHERE u.agency_id = a.id
          ) AS total_users

        FROM agencies a

        LEFT JOIN subscription_payments s
          ON s.id = (
            SELECT s2.id
            FROM subscription_payments s2
            WHERE s2.agency_id = a.id
            AND s2.status = 'completed'

            ORDER BY
              CASE
                WHEN NOW()
                  BETWEEN s2.start_date
                  AND s2.end_date
                THEN 1
                ELSE 2
              END,
              s2.end_date DESC
            LIMIT 1
          )

        LEFT JOIN subscription_plans sp
          ON sp.id = s.plan_id

        ORDER BY a.id DESC
      `);

      return res.json({
        agencies: results
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        message: 'Erreur serveur'
      });
    }
  }
);

// ======================================================
// CREATE AGENCY
// ======================================================
router.post(
  '/create',
  authenticateToken,
  checkRole(['super_admin']),
  async (req, res) => {

    const {
      name,
      email,
      phone,
      address,
      admin
    } = req.body;

    if (
      !name ||
      !email ||
      !admin?.fullname ||
      !admin?.email ||
      !admin?.password
    ) {
      return res.status(400).json({
        message: 'Champs manquants'
      });
    }

    try {

      const agencyExists = await query(
        `SELECT id FROM agencies WHERE email=?`,
        [email]
      );

      if (agencyExists.length > 0) {
        return res.status(409).json({
          message: 'Agence existe déjà'
        });
      }

      const userExists = await query(
        `SELECT id FROM users WHERE email=?`,
        [admin.email]
      );

      if (userExists.length > 0) {
        return res.status(409).json({
          message: 'Admin existe déjà'
        });
      }

      const agencyResult = await query(
        `
        INSERT INTO agencies
        (
          name,
          email,
          phone,
          address,
          status
        )
        VALUES (?, ?, ?, ?, 'active')
        `,
        [
          name,
          email,
          phone,
          address
        ]
      );

      const agency_id =
        agencyResult.insertId;

      const hashedPassword =
        await bcrypt.hash(
          admin.password,
          10
        );

      const userResult =
        await query(
          `
          INSERT INTO users
          (
            agency_id,
            fullname,
            email,
            phone,
            password,
            role,
            is_owner,
            status
          )
          VALUES
          (
            ?, ?, ?, ?, ?,
            'admin',
            1,
            'active'
          )
          `,
          [
            agency_id,
            admin.fullname,
            admin.email,
            admin.phone,
            hashedPassword
          ]
        );

      await query(
        `
        UPDATE agencies
        SET owner_id=?
        WHERE id=?
        `,
        [
          userResult.insertId,
          agency_id
        ]
      );

      await logAction({
        user_id: res.locals.id,
        agency_id,
        action: 'CREATE_AGENCY',
        entity: 'agencies',
        entity_id: agency_id,
        description: `Création agence ${name}`,
        req
      });

      await sendNotification({
        agency_id,
        message:
          `Nouvelle agence créée: ${name}`,
        type: 'success'
      });

      return res.status(201).json({
        message:
          'Agence créée avec succès',
        agency_id
      });

    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: 'Erreur serveur'
      });
    }
  }
);

// ======================================================
// DETAILS COMPLETE
// IMPORTANT: METTRE AVANT /:id
// ======================================================
router.get(
  '/:id/details',
  authenticateToken,
  checkRole(['super_admin']),
  async (req, res) => {

    try {

      const agencyId = req.params.id;

      // ======================================================
      // 1. AGENCY + OWNER
      // ======================================================
      const agencyResult = await query(
        `
        SELECT
          a.id,
          a.name,
          a.email,
          a.phone,
          a.address,
          a.status,
          a.created_at,
          a.owner_id,

          u.fullname AS owner_name,
          u.email AS owner_email,
          u.phone AS owner_phone,
          u.role AS owner_role

        FROM agencies a

        LEFT JOIN users u
          ON u.id = a.owner_id

        WHERE a.id = ?
        `,
        [agencyId]
      );

      if (agencyResult.length === 0) {
        return res.status(404).json({
          message: 'Agence introuvable'
        });
      }

      const agency = agencyResult[0];

      // ======================================================
      // 2. USERS
      // ======================================================
      const users = await query(
        `
        SELECT
          id,
          fullname,
          email,
          phone,
          role,
          status
        FROM users
        WHERE agency_id = ?
        ORDER BY id DESC
        `,
        [agencyId]
      );

      // ======================================================
      // 3. STATS
      // ======================================================
      const statsResult = await query(
        `
        SELECT

          (
            SELECT COUNT(*)
            FROM users
            WHERE agency_id = ?
          ) AS total_users,

          (
            SELECT COUNT(*)
            FROM buildings
            WHERE agency_id = ?
          ) AS total_buildings,

          (
            SELECT COUNT(*)
            FROM apartments
            WHERE agency_id = ?
          ) AS total_apartments,

          (
            SELECT COUNT(*)
            FROM tenants t
            INNER JOIN apartments ap
              ON ap.id = t.apartment_id
            INNER JOIN buildings b
              ON b.id = ap.building_id
            WHERE b.agency_id = ?
          ) AS total_tenants
        `,
        [
          agencyId,
          agencyId,
          agencyId,
          agencyId
        ]
      );

      const stats = statsResult[0] || {
        total_users: 0,
        total_buildings: 0,
        total_apartments: 0,
        total_tenants: 0
      };

    // ======================================================
  // 4. ABONNEMENT ACTUEL
  // ======================================================
  const subscriptionResult = await query(
    `
    SELECT
      sp.name AS plan_name,
      sp.price AS plan_price,
    
      s.id,
      s.plan_id,
      s.status,
      s.start_date,
      s.end_date

    FROM subscription_payments s

    LEFT JOIN subscription_plans sp
      ON sp.id = s.plan_id

    WHERE s.agency_id = ?
      AND s.status = 'completed'

    ORDER BY s.end_date DESC
    LIMIT 1
    `,
    [agencyId]
  );

  console.log(
    'SUBSCRIPTION RESULT =>',
    subscriptionResult
  );

  const subscriptionRaw =
    subscriptionResult.length > 0
      ? subscriptionResult[0]
      : null;

  const subscription = subscriptionRaw
    ? {
        ...subscriptionRaw,
        state: getSubscriptionState(subscriptionRaw)
      }
    : {
        id: null,
        plan_id: null,
        plan_name: null,
        plan_price: null,
        status: null,
        state: 'no_subscription',
        start_date: null,
        end_date: null
      };

  console.log(
    'FINAL SUBSCRIPTION =>',
    subscription
  );
      // ======================================================
      // 5. FUTUR ABONNEMENT
      // ======================================================
      const futureSubscriptionResult =
        await query(
          `
          SELECT
            sp.name AS future_plan_name,
            sp.price AS future_plan_price,

            s.start_date
              AS future_start_date,

            s.end_date
              AS future_end_date,

            TIMESTAMPDIFF(
              MONTH,
              s.start_date,
              s.end_date
            ) AS future_months

          FROM subscription_payments s

          LEFT JOIN subscription_plans sp
            ON sp.id = s.plan_id

          WHERE s.agency_id = ?
          AND s.start_date > NOW()

          ORDER BY s.start_date ASC
          LIMIT 1
          `,
          [agencyId]
        );

      const futureSubscription =
        futureSubscriptionResult[0] || null;

      // ======================================================
      // RESPONSE
      // ======================================================
      return res.json({
        agency,
        stats,
        subscription,
        futureSubscription,
        users
      });

    } catch (err) {

      console.error(
        'DETAIL ERROR =>',
        err
      );

      return res.status(500).json({
        message: 'Erreur serveur',
        error: err.message
      });
    }
  }
);

// ======================================================
// GET SINGLE AGENCY
// ======================================================
router.get(
  '/:id',
  authenticateToken,
  checkRole(['super_admin']),
  async (req, res) => {

    try {

      const agency =
        await query(
          `
          SELECT *
          FROM agencies
          WHERE id=?
          `,
          [req.params.id]
        );

      if (agency.length === 0) {
        return res.status(404).json({
          message:
            'Agence introuvable'
        });
      }

      return res.json(
        agency[0]
      );

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        message:
          'Erreur serveur'
      });
    }
  }
);

// ======================================================
// DELETE
// ======================================================
router.delete(
  '/:id',
  authenticateToken,
  checkRole(['super_admin']),
  async (req, res) => {

    try {

      const agency =
        await query(
          `
          SELECT *
          FROM agencies
          WHERE id=?
          `,
          [req.params.id]
        );

      if (agency.length === 0) {
        return res.status(404).json({
          message:
            'Agence introuvable'
        });
      }

      await logAction({
        user_id: res.locals.id,
        agency_id:
          req.params.id,
        action:
          'DELETE_AGENCY',
        entity: 'agencies',
        entity_id:
          req.params.id,
        description:
          `Suppression agence ${agency[0].name}`,
        req
      });

      await query(
        `
        DELETE FROM agencies
        WHERE id=?
        `,
        [req.params.id]
      );

      return res.json({
        message:
          'Agence supprimée'
      });

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        message:
          'Erreur serveur'
      });
    }
  }
);

// ======================================================
// UPDATE OWNER
// ======================================================
router.put(
  '/:id/update-owner',
  authenticateToken,
  async (req, res) => {

    try {

      const agencyId = req.params.id;

      const {
        fullname,
        email,
        phone,
        role
      } = req.body;

      // vérifier champs
      if (
        !fullname ||
        !email ||
        !phone ||
        !role
      ) {
        return res.status(400).json({
          message: 'Tous les champs sont obligatoires'
        });
      }

      // récupérer agence
      const agencyResult = await query(
        `
        SELECT owner_id
        FROM agencies
        WHERE id = ?
        `,
        [agencyId]
      );

      if (agencyResult.length === 0) {
        return res.status(404).json({
          message: 'Agence introuvable'
        });
      }

      const ownerId =
        agencyResult[0].owner_id;

      if (!ownerId) {
        return res.status(404).json({
          message:
            'Admin principal introuvable'
        });
      }

      // vérifier email déjà utilisé
      const emailExists =
        await query(
          `
          SELECT id
          FROM users
          WHERE email = ?
          AND id != ?
          `,
          [email, ownerId]
        );

      if (emailExists.length > 0) {
        return res.status(409).json({
          message:
            'Cet email existe déjà'
        });
      }

      // update admin principal
      await query(
        `
        UPDATE users
        SET
          fullname = ?,
          email = ?,
          phone = ?,
          role = ?
        WHERE id = ?
        `,
        [
          fullname,
          email,
          phone,
          role,
          ownerId
        ]
      );

      // log audit
      await logAction({
        user_id: res.locals.id,
        agency_id: agencyId,
        action: 'UPDATE_OWNER',
        entity: 'users',
        entity_id: ownerId,
        description:
          `Modification admin principal`,
        req
      });

      return res.json({
        message:
          'Admin principal modifié avec succès'
      });

    } catch (error) {

      console.error(
        'UPDATE OWNER ERROR =>',
        error
      );

      return res.status(500).json({
        message:
          'Erreur serveur'
      });
    }
  }
);

module.exports = router;