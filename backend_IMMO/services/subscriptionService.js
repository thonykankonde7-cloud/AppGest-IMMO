// services/subscriptionService.js

function getSubscriptionState(subscription) {
  if (!subscription) {
    return 'no_subscription';
  }

  const {
    status,
    start_date,
    end_date
  } = subscription;

  // ❌ abonnement non validé
  if (status !== 'completed') {
    return 'inactive';
  }

  const now = new Date();

  const start = start_date ? new Date(start_date) : null;
  const end = end_date ? new Date(end_date) : null;

  // sécurité si dates manquantes
  if (!start || !end) {
    return 'inactive';
  }

  // ⏳ pas encore commencé
  if (now < start) {
    return 'pending';
  }

  // ⛔ expiré
  if (now > end) {
    return 'expired';
  }

  // ✅ actif
  return 'active';
}

module.exports = {
  getSubscriptionState
};