const connection = require('../connection');

function sendNotification({
    agency_id,
    user_id = null,
    message,
    type = 'info',
    action_type = null
}) {

    connection.query(
        `INSERT INTO notifications 
        (agency_id, target_user_id, message, type, action_type)
        VALUES (?, ?, ?, ?, ?)`,
        [agency_id, user_id, message, type, action_type]
    );

    if (global.io) {

        const payload = {
            message,
            type,
            action_type,
            created_at: new Date()
        };

        if (user_id) {
            global.io.to(`user_${user_id}`).emit('notification', payload);
        } else {
            global.io.to(`agency_${agency_id}`).emit('notification', payload);
        }
    }
}

module.exports = { sendNotification };
