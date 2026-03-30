const prisma = require('../config/prisma');
const { formatAddressText } = require('../utils/address');

const formatAddress = (address) => ({
  id: address.id,
  user_id: address.userId,
  label: address.label,
  line1: address.line1,
  line2: address.line2,
  city: address.city,
  state: address.state,
  postal_code: address.postalCode,
  latitude: address.latitude,
  longitude: address.longitude,
  is_default: address.isDefault,
  created_at: address.createdAt,
});

const getByUser = async (userId) => {
  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return rows.map(formatAddress);
};

const createAddress = async ({ userId, label, line1, line2, city, state, postalCode, isDefault }) => {
  return prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const created = await tx.address.create({
      data: {
        userId,
        label,
        line1,
        line2,
        city,
        state,
        postalCode,
        isDefault: Boolean(isDefault),
      },
    });

    return formatAddress(created);
  });
};

const updateAddress = async ({ addressId, userId, payload }) => {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) return null;

  return prisma.$transaction(async (tx) => {
    if (payload.isDefault === true) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await tx.address.update({
      where: { id: addressId },
      data: payload,
    });

    return formatAddress(updated);
  });
};

const deleteAddress = async ({ addressId, userId }) => {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) return null;

  await prisma.address.delete({ where: { id: addressId } });
  return { id: addressId };
};

const findByIdForUser = async ({ addressId, userId }) => {
  return prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });
};

module.exports = {
  getByUser,
  createAddress,
  updateAddress,
  deleteAddress,
  findByIdForUser,
  formatAddressText,
};
