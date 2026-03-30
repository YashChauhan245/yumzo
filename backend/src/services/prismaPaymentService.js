const prisma = require('../config/prisma');

const formatPayment = (payment) => ({
  id: payment.id,
  order_id: payment.orderId,
  user_id: payment.userId,
  amount: payment.amount,
  payment_method: payment.method,
  payment_status: payment.status,
  transaction_id: payment.transactionId,
  failure_reason: payment.failureReason,
  created_at: payment.createdAt,
});

const findByOrderId = async (orderId) => {
  const payment = await prisma.payment.findFirst({
    where: { orderId },
  });

  return payment ? formatPayment(payment) : null;
};

const savePayment = async ({
  orderId,
  userId,
  amount,
  paymentMethod,
  paymentStatus,
  transactionId = null,
  failureReason = null,
}) => {
  const existingPayment = await prisma.payment.findFirst({
    where: { orderId },
    select: { id: true },
  });

  const payment = existingPayment
    ? await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          amount,
          method: paymentMethod,
          status: paymentStatus,
          transactionId,
          failureReason,
        },
      })
    : await prisma.payment.create({
        data: {
          orderId,
          userId,
          amount,
          method: paymentMethod,
          status: paymentStatus,
          transactionId,
          failureReason,
        },
      });

  return formatPayment(payment);
};

module.exports = {
  findByOrderId,
  savePayment,
};
