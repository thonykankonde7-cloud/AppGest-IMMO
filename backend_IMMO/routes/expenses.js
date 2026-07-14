const express = require('express');
const router = express.Router();
const connection = require('../connection');

const { authenticateToken } = require('../services/authentification');
const { checkPermission } = require('../services/permissions');
const { logAction } = require('../services/auditLog');
const { sendNotification } = require('../services/notificationService');

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


// ================= CREATE EXPENSE =================
router.post(
    '/create',
    authenticateToken,
    checkPermission('expenses.create'),
    async (req, res) => {

        const {
            title,
            amount,
            category,
            expense_date,
            description
        } = req.body;

        const agency_id = res.locals.agency_id;

        if (!title || !amount || !expense_date) {
            return res.status(400).json({
                message: "Champs obligatoires manquants"
            });
        }

        try {

            const result = await query(
                `INSERT INTO expenses
                (agency_id, title, amount, category, expense_date, description)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    agency_id,
                    title,
                    amount,
                    category,
                    expense_date,
                    description
                ]
            );

            // 🔥 LOG
            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'CREATE_EXPENSE',
                entity: 'expenses',
                entity_id: result.insertId,
                description: `Dépense créée: ${title}`,
                req
            });

            // 🔔 NOTIFICATION
            sendNotification({
                agency_id,
                message: `Nouvelle dépense: ${title}`,
                type: 'warning'
            });

            return res.status(201).json({
                message: "Dépense ajoutée",
                expense_id: result.insertId
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= GET ALL EXPENSES =================
router.get(
    '/',
    authenticateToken,
    checkPermission('expenses.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            const expenses = await query(
                `SELECT *
                 FROM expenses
                 WHERE agency_id=?
                 ORDER BY expense_date DESC`,
                [agency_id]
            );

            return res.json(expenses);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= GET SINGLE EXPENSE =================
router.get(
    '/:id',
    authenticateToken,
    checkPermission('expenses.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            const expense = await query(
                `SELECT * FROM expenses
                 WHERE id=? AND agency_id=?`,
                [req.params.id, agency_id]
            );

            if (expense.length === 0) {
                return res.status(404).json({
                    message: "Dépense introuvable"
                });
            }

            return res.json(expense[0]);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= UPDATE EXPENSE =================
router.patch(
    '/update',
    authenticateToken,
    checkPermission('expenses.update'),
    async (req, res) => {

        const {
            id,
            title,
            amount,
            category,
            expense_date,
            description
        } = req.body;

        const agency_id = res.locals.agency_id;

        try {

            const result = await query(
                `UPDATE expenses
                 SET title=?, amount=?, category=?, expense_date=?, description=?
                 WHERE id=? AND agency_id=?`,
                [
                    title,
                    amount,
                    category,
                    expense_date,
                    description,
                    id,
                    agency_id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Dépense introuvable"
                });
            }

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'UPDATE_EXPENSE',
                entity: 'expenses',
                entity_id: id,
                description: `Modification dépense ID ${id}`,
                req
            });

            return res.json({
                message: "Dépense mise à jour"
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= DELETE EXPENSE =================
router.delete(
    '/:id',
    authenticateToken,
    checkPermission('expenses.delete'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            const result = await query(
                `DELETE FROM expenses
                 WHERE id=? AND agency_id=?`,
                [req.params.id, agency_id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Dépense introuvable"
                });
            }

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'DELETE_EXPENSE',
                entity: 'expenses',
                entity_id: req.params.id,
                description: `Suppression dépense`,
                req
            });

            return res.json({
                message: "Dépense supprimée"
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= DASHBOARD SUMMARY =================
router.get(
    '/summary/dashboard',
    authenticateToken,
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            const data = await query(
                `
                SELECT 
                    (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE agency_id=?) AS total_expenses,
                    (SELECT COALESCE(SUM(amount_paid),0) FROM payments WHERE agency_id=? AND status='completed') AS total_income
                `,
                [agency_id, agency_id]
            );

            return res.json(data[0]);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);

module.exports = router;