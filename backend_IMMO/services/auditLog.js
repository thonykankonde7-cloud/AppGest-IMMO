const connection = require('../connection');

// ==========================
// LOG ACTION SERVICE
// ==========================
function logAction({
    user_id,
    agency_id = null,
    action,
    entity,
    entity_id = null,
    description = '',
    req
}) {
    try {

        const ip =
            req?.ip ||
            req?.connection?.remoteAddress ||
            null;

        const userAgent =
            req?.headers?.['user-agent'] || null;

        connection.query(
            `
            INSERT INTO audit_logs
            (
                user_id,
                agency_id,
                action,
                entity,
                entity_id,
                description,
                ip_address,
                user_agent
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                user_id,
                agency_id,
                action,
                entity,
                entity_id,
                description,
                ip,
                userAgent
            ]
        );

    } catch (error) {
        console.error(
            'Audit log error:',
            error
        );
    }
}

module.exports = {
    logAction
};