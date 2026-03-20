/**
 * Mock payment gateway service.
 *
 * Rules (deterministic, no randomness):
 *   - payment_method 'cash_on_delivery'  → always succeeds
 *   - card number / UPI ID starting with 'fail_' → always fails
 *   - everything else                    → always succeeds
 *
 * In a real app this module would call Razorpay / Stripe / etc.
 */

const SUPPORTED_METHODS = ['card', 'upi', 'cash_on_delivery'];

/**
 * Simulate a payment attempt.
 * @param {{
 *   paymentMethod: 'card' | 'upi' | 'cash_on_delivery',
 *   paymentDetails?: string   // card number or UPI id (optional, treated as opaque)
 * }} options
 * @returns {{ success: boolean, transactionId: string | null, failureReason: string | null }}
 */
const processPayment = ({ paymentMethod, paymentDetails = '' }) => {
  if (!SUPPORTED_METHODS.includes(paymentMethod)) {
    return {
      success: false,
      transactionId: null,
      failureReason: `Unsupported payment method: ${paymentMethod}`,
    };
  }

  // Cash on delivery always succeeds
  if (paymentMethod === 'cash_on_delivery') {
    return {
      success: true,
      transactionId: `cod_${Date.now()}`,
      failureReason: null,
    };
  }

  // Any detail prefixed with 'fail_' simulates a declined payment
  if (typeof paymentDetails === 'string' && paymentDetails.startsWith('fail_')) {
    return {
      success: false,
      transactionId: null,
      failureReason: 'Payment declined by issuer',
    };
  }

  // Default: success
  return {
    success: true,
    transactionId: 'txn_' + Date.now() + '_mock',
    failureReason: null,
  };
};

module.exports = { processPayment, SUPPORTED_METHODS };
