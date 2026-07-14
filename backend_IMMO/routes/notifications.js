const express = require('express');
const router = express.Router();
const connection = require('../connection');

const { authenticateToken } = require('../services/authentification');

function queryAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}
// NOTIFICATIONS USER
router.get('/my', authenticateToken, async (req, res) => {

    const user_id = res.locals.id;
    const agency_id = res.locals.agency_id;

    try {
        const notifications = await queryAsync(
            `
            SELECT id, message, type, action_type, is_read, created_at
            FROM notifications
            WHERE agency_id = ?
              AND (
                    target_user_id = ?
                    OR target_user_id IS NULL
                  )
            ORDER BY created_at DESC
            `,
            [agency_id, user_id]
        );

        return res.json(notifications);

    } catch (err) {
        return res.status(500).json(err);
    }
});
// NOTIFICATIONS AGENCE (ADMIN)
router.get('/agency', authenticateToken, async (req, res) => {

    const agency_id = res.locals.agency_id;

    try {
        const notifications = await queryAsync(
            `
            SELECT id, message, type, action_type, is_read, created_at
            FROM notifications
            WHERE agency_id = ?
            ORDER BY created_at DESC
            `,
            [agency_id]
        );

        return res.json(notifications);

    } catch (err) {
        return res.status(500).json(err);
    }
});
// MARQUER COMME LU
router.patch('/read/:id', authenticateToken, async (req, res) => {

    const user_id = res.locals.id;
    const agency_id = res.locals.agency_id;
    const notif_id = req.params.id;

    try {
        await queryAsync(
            `
            UPDATE notifications
            SET is_read = 1, read_at = NOW()
            WHERE id = ?
              AND agency_id = ?
              AND (
                    target_user_id = ?
                    OR target_user_id IS NULL
                  )
            `,
            [notif_id, agency_id, user_id]
        );

        return res.json({ message: "Notification marquée comme lue" });

    } catch (err) {
        return res.status(500).json(err);
    }
});
// COMPTEUR UNREAD (TRÈS IMPORTANT UI)
router.get('/unread-count', authenticateToken, async (req, res) => {

    const user_id = res.locals.id;
    const agency_id = res.locals.agency_id;

    try {
        const result = await queryAsync(
            `
            SELECT COUNT(*) as total
            FROM notifications
            WHERE agency_id = ?
              AND is_read = 0
              AND (
                    target_user_id = ?
                    OR target_user_id IS NULL
                  )
            `,
            [agency_id, user_id]
        );

        return res.json(result[0]);

    } catch (err) {
        return res.status(500).json(err);
    }
});

module.exports = router;