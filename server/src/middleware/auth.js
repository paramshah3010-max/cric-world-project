import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';

// Requires a valid "Authorization: Bearer <token>" header. Attaches the decoded
// token payload to req.user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}

// Restricts a route to one of the given roles. Use after requireAuth.
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have access to this resource'));
    }
    return next();
  };
}
