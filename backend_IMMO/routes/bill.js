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

// ================= HELPER =================
async function updateBillStatus(bill_id, agency_id) {

    const bills = await query(
        `SELECT amount, paid_amount FROM bills WHERE id=? AND agency_id=?`,
        [bill_id, agency_id]
    );

    if (bills.length === 0) return;

    const bill = bills[0];

    let status = 'pending';

    if (bill.paid_amount >= bill.amount) {
        status = 'paid';

        await query(
            `UPDATE bills SET status='paid', paid_at=NOW() WHERE id=?`,
            [bill_id]
        );
    } else if (bill.paid_amount > 0) {
        status = 'pending';
    }

    await query(
        `UPDATE bills SET status=? WHERE id=?`,
        [status, bill_id]
    );
}


// ================= CREATE BILL =================
router.post(
    '/create',
    authenticateToken,
    checkPermission('bills.create'),
    async (req, res) => {

        const {
            tenant_id,
            apartment_id,
            amount,
            due_date,
            description
        } = req.body;

        const agency_id = res.locals.agency_id;

        if (!tenant_id || !amount || !due_date) {
            return res.status(400).json({ message: "Champs requis" });
        }

        try {

            const bill_number = `BILL-${Date.now()}`;

            const result = await query(
                `INSERT INTO bills
                (agency_id, tenant_id, apartment_id, bill_number, amount, due_date, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [
                    agency_id,
                    tenant_id,
                    apartment_id,
                    bill_number,
                    amount,
                    due_date,
                    description
                ]
            );

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'CREATE_BILL',
                entity: 'bills',
                entity_id: result.insertId,
                description: `Création facture ${bill_number}`,
                req
            });

            return res.status(201).json({
                message: "Facture créée",
                bill_id: result.insertId
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= GET ALL BILLS =================
router.get(
    '/',
    authenticateToken,
    checkPermission('bills.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {
            const bills = await query(
                `SELECT b.*,
                        t.fullname AS tenant_name,
                        a.number AS apartment_number
                 FROM bills b
                 LEFT JOIN tenants t ON t.id = b.tenant_id
                 LEFT JOIN apartments a ON a.id = b.apartment_id
                 WHERE b.agency_id=?
                 ORDER BY b.created_at DESC`,
                [agency_id]
            );

            return res.json(bills);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= GET ONE BILL =================
router.get(
    '/:id',
    authenticateToken,
    checkPermission('bills.read'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;
        const id = req.params.id;

        try {

            const bill = await query(
                `SELECT * FROM bills WHERE id=? AND agency_id=?`,
                [id, agency_id]
            );

            if (bill.length === 0) {
                return res.status(404).json({ message: "Facture introuvable" });
            }

            return res.json(bill[0]);

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= ADD PAYMENT → AUTO UPDATE BILL =================
router.post(
    '/add-payment',
    authenticateToken,
    checkPermission('payments.create'),
    async (req, res) => {

        const {
            bill_id,
            tenant_id,
            amount_paid,
            payment_method
        } = req.body;

        const agency_id = res.locals.agency_id;

        if (!bill_id || !amount_paid) {
            return res.status(400).json({ message: "Champs requis" });
        }

        try {

            // 1. INSERT PAYMENT
            await query(
                `INSERT INTO payments
                (agency_id, bill_id, tenant_id, amount_paid, payment_date, payment_method, status)
                VALUES (?, ?, ?, ?, NOW(), ?, 'completed')`,
                [
                    agency_id,
                    bill_id,
                    tenant_id,
                    amount_paid,
                    payment_method || 'cash'
                ]
            );

            // 2. UPDATE BILL (paid_amount)
            await query(
                `UPDATE bills
                 SET paid_amount = paid_amount + ?
                 WHERE id=? AND agency_id=?`,
                [amount_paid, bill_id, agency_id]
            );

            // 3. AUTO STATUS UPDATE
            await updateBillStatus(bill_id, agency_id);

            // 4. LOG
            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'PAYMENT_ADD',
                entity: 'payments',
                entity_id: bill_id,
                description: `Paiement ajouté ${amount_paid}`,
                req
            });

            // 5. NOTIFICATION
            sendNotification({
                agency_id,
                message: `Paiement reçu: ${amount_paid}`,
                type: 'success'
            });

            return res.json({
                message: "Paiement enregistré"
            });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);


// ================= DELETE BILL =================
router.delete(
    '/:id',
    authenticateToken,
    checkPermission('bills.delete'),
    async (req, res) => {

        const agency_id = res.locals.agency_id;

        try {

            await query(
                `DELETE FROM bills WHERE id=? AND agency_id=?`,
                [req.params.id, agency_id]
            );

            logAction({
                user_id: res.locals.id,
                agency_id,
                action: 'DELETE_BILL',
                entity: 'bills',
                entity_id: req.params.id,
                description: `Suppression facture`,
                req
            });

            return res.json({ message: "Facture supprimée" });

        } catch (err) {
            return res.status(500).json(err);
        }
    }
);

module.exports = router;