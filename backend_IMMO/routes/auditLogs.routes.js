const express = require('express');
const router = express.Router();

const connection = require('../connection');

const {
    authenticateToken
} = require('../services/authentification');

// ==========================
// PROMISE QUERY HELPER
// ==========================
function queryAsync(sql, values = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// ==========================
// GET AUDIT LOGS
// ==========================
router.get(
    '/',
    authenticateToken,
    async (req, res) => {

        try {

            const logs = await queryAsync(`
                SELECT *
                FROM audit_logs
                ORDER BY created_at DESC
                LIMIT 200
            `);

            return res.json({
                logs
            });

        } catch (error) {

            return res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;