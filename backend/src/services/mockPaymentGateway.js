// Mock payment gateway — simulates card, UPI, and cash on delivery payments
// In a real app, this would call Razorpay, Stripe, or similar

// Rules:
// - cash_on_delivery always succeeds
// - payment_details starting with 'fail_' always fails (for testing)
// - everything else succeeds

const supportedMethods = ['card', 'upi', 'cash_on_delivery'];

const processPayment = ({ paymentMethod, paymentDetails = '' }) => {
  if (!supportedMethods.includes(paymentMethod)) {
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

  // Simulate a failed payment (useful for testing)
  if (typeof paymentDetails === 'string' && paymentDetails.startsWith('fail_')) {
    return {
      success: false,
      transactionId: null,
      failureReason: 'Payment declined by issuer',
    };
  }

  // All other payments succeed
  return {
    success: true,
    transactionId: 'txn_' + Date.now() + '_mock',
    failureReason: null,
  };
};

module.exports = { processPayment };
