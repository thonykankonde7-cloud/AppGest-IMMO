const express = require('express');
const router = express.Router();

const connection = require('../connection');
const auth = require('../services/authentification');

// ======================================================
// 📊 DASHBOARD STATS (SAAS PRO)
// ======================================================
router.get('/stats', auth.authenticateToken, (req, res) => {

  const role = res.locals.role;
  const agency_id = res.locals.agency_id;
  const user_id = res.locals.id;

  // ======================================================
  // 👑 SUPER ADMIN (SAAS GLOBAL)
  // ======================================================
  if (role === 'super_admin') {

    const statsQuery = `
SELECT
  (SELECT COUNT(*) FROM agencies)
    AS total_agencies,

  (SELECT COUNT(*) FROM users
    WHERE role='admin')
    AS total_admins,

  (SELECT COUNT(*) FROM users)
    AS total_users,

  (
    SELECT IFNULL(SUM(amount),0)
    FROM subscription_payments
    WHERE status='completed'
  ) AS total_income,

  (
    SELECT IFNULL(SUM(amount),0)
    FROM saas_withdrawals
    WHERE status IN ('pending', 'approved')
  ) AS total_withdrawn,

  (
    (
      SELECT IFNULL(SUM(amount),0)
      FROM subscription_payments
      WHERE status='completed'
    )
    -
    (
      SELECT IFNULL(SUM(amount),0)
      FROM saas_withdrawals
      WHERE status IN ('pending', 'approved')
    )
  ) AS saas_balance,

  /* 👇 AJOUT BUILDINGS */
  (
    SELECT COUNT(*) 
    FROM buildings
  ) AS total_buildings,

  (SELECT COUNT(*) FROM buildings WHERE agency_id IS NOT NULL) AS buildings_with_agency,
  (SELECT COUNT(*) / (SELECT COUNT(*) FROM agencies) FROM buildings) AS avg_buildings_per_agency
`;

    const monthlyRevenueQuery = `
      SELECT
        DATE_FORMAT(payment_date, '%Y-%m') AS month,
        IFNULL(SUM(amount),0) AS total
      FROM subscription_payments
      WHERE status='completed'
      GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
      ORDER BY month ASC
    `;

    const planDistributionQuery = `
      SELECT
        sp.name AS plan,
        COUNT(*) AS total
      FROM subscription_payments p
      JOIN subscription_plans sp ON sp.id = p.plan_id
      WHERE p.status='completed'
      GROUP BY sp.name
    `;

    connection.query(statsQuery, (err, statsResult) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur stats' });
      }

      connection.query(monthlyRevenueQuery, (err2, revenueResult) => {

        if (err2) {
          console.error(err2);
          return res.status(500).json({ message: 'Erreur revenus mensuels' });
        }

        connection.query(planDistributionQuery, (err3, plansResult) => {

          if (err3) {
            console.error(err3);
            return res.status(500).json({ message: 'Erreur plans SaaS' });
          }

          return res.json({
            ...statsResult[0],
            monthly_revenue: revenueResult,
            plan_distribution: plansResult
          });
        });
      });
    });

    return;
  }

  // ======================================================
  // 🧑‍💼 ADMIN (AGENCE)
  // ======================================================
  if (role === 'admin') {

    const query = `
      SELECT
  
        /* IMMEUBLES */
        (
          SELECT COUNT(*)
          FROM buildings
          WHERE agency_id = ?
        ) AS total_buildings,
  
        /* APPARTEMENTS */
        (
          SELECT COUNT(*)
          FROM apartments
          WHERE agency_id = ?
        ) AS total_apartments,
  
        /* APPARTEMENTS OCCUPÉS */
        (
          SELECT COUNT(*)
          FROM apartments
          WHERE agency_id = ?
          AND status = 'occupied'
        ) AS occupied_apartments,
  
        /* APPARTEMENTS DISPONIBLES */
        (
          SELECT COUNT(*)
          FROM apartments
          WHERE agency_id = ?
          AND status = 'available'
        ) AS available_apartments,
  
        /* LOCATAIRES */
        (
          SELECT COUNT(*)
          FROM tenants
          WHERE agency_id = ?
        ) AS total_tenants,
  
        /* PAIEMENTS */
        (
          SELECT COUNT(*)
          FROM payments
          WHERE agency_id = ?
        ) AS total_payments,
  
        /* REVENUS */
        (
          SELECT IFNULL(SUM(amount_paid),0)
          FROM payments
          WHERE agency_id = ?
          AND status = 'completed'
        ) AS total_income,
  
        /* DEPENSES */
        (
          SELECT IFNULL(SUM(amount),0)
          FROM expenses
          WHERE agency_id = ?
        ) AS total_expenses,
  
        /* DOCUMENTS */
        (
          SELECT COUNT(*)
          FROM documents
          WHERE agency_id = ?
        ) AS total_documents
    `;
    
      console.log('ROLE =>', role);
      console.log('AGENCY_ID =>', agency_id);

    connection.query(
      query,
      [
        agency_id,
        agency_id,
        agency_id,
        agency_id,
        agency_id,
        agency_id,
        agency_id,
        agency_id,
        agency_id
      ],
      (err, results) => {

        if (err) {
          console.error('MYSQL ERROR =>', err);
          return res.status(500).json({
            message: err.message
          });
        }
      
        console.log('RESULTS =>', results);
      
        const data = results[0];
      
        data.net_profit =
          Number(data.total_income || 0) -
          Number(data.total_expenses || 0);
      
        return res.json(data);
      }
    );
  
    return;
  }
  // ======================================================
  // 🧑‍🔧 AGENT
  // ======================================================
  if (role === 'agent') {

    const query = `
      SELECT
        (SELECT COUNT(*) FROM visits WHERE agency_id=?) AS total_visits,
        (SELECT COUNT(*) FROM leads WHERE agency_id=?) AS total_leads,
        (SELECT COUNT(*) FROM apartments WHERE agency_id=? AND status='available') AS available_apartments
    `;

    connection.query(query, [
      agency_id,
      agency_id,
      agency_id
    ], (err, results) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur agent' });
      }

      res.json(results[0]);
    });

    return;
  }

  // ======================================================
  // 🏠 TENANT
  // ======================================================
  if (role === 'tenant') {

    const query = `
      SELECT
        (SELECT IFNULL(SUM(amount),0)
         FROM subscription_payments
         WHERE tenant_id=?
         AND status='completed'
        ) AS total_paid,

        (SELECT COUNT(*)
         FROM documents
         WHERE tenant_id=?
        ) AS total_documents,

        (SELECT COUNT(*)
         FROM maintenance_requests
         WHERE tenant_id=?
        ) AS total_requests,

        (SELECT a.name
         FROM apartments a
         WHERE a.tenant_id=?
         LIMIT 1
        ) AS apartment_name
    `;

    connection.query(query, [
      user_id,
      user_id,
      user_id,
      user_id
    ], (err, results) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur tenant' });
      }

      res.json(results[0]);
    });

    return;
  }

  return res.status(403).json({
    message: 'Rôle non autorisé'
  });
});


// ======================================================
// 🏢 LISTE DES AGENCES (SAAS DASHBOARD)
// ======================================================
router.get(
  '/agencies',
  auth.authenticateToken,
  async (req, res) => {

    const role = res.locals.role;

    if (role !== 'super_admin') {
      return res.status(403).json({
        message: 'Accès refusé'
      });
    }

    const query = `
      SELECT
        a.id,
        a.name,
        a.email,
        a.phone,

        -- =====================
        -- ABONNEMENT ACTUEL
        -- =====================
        current_plan.name AS plan_name,
        current_plan.price AS plan_price,

        current_sub.start_date,
        current_sub.end_date AS subscription_end,

        CASE
          WHEN current_sub.id IS NOT NULL
            THEN 'active'

          WHEN expired_sub.id IS NOT NULL
            THEN 'expired'

          ELSE 'expired'
        END AS status,

        -- =====================
        -- PROCHAIN ABONNEMENT
        -- =====================
        future_plan.name AS future_plan_name,

        future_sub.start_date
          AS future_start_date,

        future_sub.end_date
          AS future_end_date,

        TIMESTAMPDIFF(
          MONTH,
          future_sub.start_date,
          future_sub.end_date
        ) AS future_months

      FROM agencies a

      -- =====================================
      -- ABONNEMENT ACTUEL
      -- =====================================
      LEFT JOIN subscription_payments current_sub
        ON current_sub.id = (
          SELECT s1.id
          FROM subscription_payments s1
          WHERE s1.agency_id = a.id
            AND CURDATE()
            BETWEEN s1.start_date
            AND s1.end_date
            AND s1.status='completed'
          ORDER BY s1.end_date DESC
          LIMIT 1
        )

      LEFT JOIN subscription_plans current_plan
        ON current_plan.id =
        current_sub.plan_id

      -- =====================================
      -- DERNIER ABONNEMENT EXPIRE
      -- =====================================
      LEFT JOIN subscription_payments expired_sub
        ON expired_sub.id = (
          SELECT s2.id
          FROM subscription_payments s2
          WHERE s2.agency_id = a.id
            AND s2.end_date < CURDATE()
            AND s2.status='completed'
          ORDER BY s2.end_date DESC
          LIMIT 1
        )

      -- =====================================
      -- PROCHAIN ABONNEMENT
      -- =====================================
      LEFT JOIN subscription_payments future_sub
        ON future_sub.id = (
          SELECT s3.id
          FROM subscription_payments s3
          WHERE s3.agency_id = a.id
            AND s3.start_date > CURDATE()
            AND s3.status='completed'
          ORDER BY s3.start_date ASC
          LIMIT 1
        )

      LEFT JOIN subscription_plans future_plan
        ON future_plan.id =
        future_sub.plan_id

      ORDER BY a.id DESC
    `;

    connection.query(
      query,
      (err, results) => {

        if (err) {
          console.error(err);

          return res.status(500).json({
            message: 'Erreur serveur'
          });
        }

        res.json({
          agencies: results
        });
      }
    );
  }
);

// ======================================================
// ⛔ SUSPEND AGENCY
// ======================================================
router.patch('/agency/suspend/:id', auth.authenticateToken, (req, res) => {

  const agencyId = req.params.id;

  const query = `
    UPDATE agencies
    SET status='suspended'
    WHERE id=?
  `;

  connection.query(query, [agencyId], (err) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    res.json({ message: 'Agence suspendue' });
  });
});


module.exports = router;