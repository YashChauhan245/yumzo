const prisma = require('../config/prisma');

const baseUserSelect = {
  id: true,
  name: true,
  email: true,
  password: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
};

const toPublicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  avatar_url: u.avatarUrl,
  is_active: u.isActive,
  created_at: u.createdAt,
});

const toPrivateUser = (u) => ({
  ...toPublicUser(u),
  password: u.password,
});

const findByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: baseUserSelect,
  });
  return user ? toPrivateUser(user) : null;
};

const findById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: baseUserSelect,
  });
  return user ? toPublicUser(user) : null;
};

const create = async ({ name, email, password, phone = null, role = 'customer' }) => {
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password,
      phone,
      role,
    },
    select: baseUserSelect,
  });
  return toPublicUser(user);
};

module.exports = { findByEmail, findById, create };
