const express = require('express');
const router = express.Router();
const connection = require('../connection');

const {
  authenticateToken
} = require('../services/authentification');

// helper
function query(sql, values = []) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

//
// GET SETTINGS
//
router.get(
  '/',
  authenticateToken,
  async (req, res) => {
    try {

      const rows = await query(
        'SELECT * FROM saas_settings LIMIT 1'
      );

      return res.json(rows[0] || null);

    } catch (error) {
      return res.status(500).json({
        message: 'Erreur chargement settings',
        error
      });
    }
  }
);

//
// SAVE SETTINGS (CREATE OR UPDATE)
//
router.post(
  '/save',
  authenticateToken,
  async (req, res) => {

    const {
      app_name,
      support_email,
      support_phone,
      currency,
      tax,
      trial_days,
      google_login,
      email_login,
      registration_open,
      allow_free_plan,
      auto_suspend
    } = req.body;

    try {

      const rows = await query(
        'SELECT id FROM saas_settings LIMIT 1'
      );

      // UPDATE
      if (rows.length > 0) {

        await query(
          `UPDATE saas_settings SET
            app_name=?,
            support_email=?,
            support_phone=?,
            currency=?,
            tax=?,
            trial_days=?,
            google_login=?,
            email_login=?,
            registration_open=?,
            allow_free_plan=?,
            auto_suspend=?
          WHERE id=?`,
          [
            app_name,
            support_email,
            support_phone,
            currency,
            tax,
            trial_days,
            google_login,
            email_login,
            registration_open,
            allow_free_plan,
            auto_suspend,
            rows[0].id
          ]
        );

      } else {

        // CREATE
        await query(
          `INSERT INTO saas_settings (
            app_name,
            support_email,
            support_phone,
            currency,
            tax,
            trial_days,
            google_login,
            email_login,
            registration_open,
            allow_free_plan,
            auto_suspend
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            app_name,
            support_email,
            support_phone,
            currency,
            tax,
            trial_days,
            google_login,
            email_login,
            registration_open,
            allow_free_plan,
            auto_suspend
          ]
        );
      }

      return res.json({
        message: 'Settings sauvegardés'
      });

    } catch (error) {
      return res.status(500).json({
        message: 'Erreur sauvegarde settings',
        error
      });
    }
  }
);

module.exports = router;