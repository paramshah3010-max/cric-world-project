import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { signToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

// Never leak the password hash to clients.
function toPublicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function registerUser({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw ApiError.badRequest('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: passwordHash },
  });

  const token = signToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw ApiError.notFound('User not found');
  return toPublicUser(user);
}
