import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { registerUser, loginUser, getUserById } from '../services/auth.service.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    throw ApiError.badRequest('name, email and password are required');
  }
  if (!EMAIL_RE.test(email)) {
    throw ApiError.badRequest('Please provide a valid email address');
  }
  if (password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long');
  }

  const result = await registerUser({ name, email, password });
  res.status(201).json({ data: result });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    throw ApiError.badRequest('email and password are required');
  }

  const result = await loginUser({ email, password });
  res.json({ data: result });
});

export const me = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.sub);
  res.json({ data: user });
});
