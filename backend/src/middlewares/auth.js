import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      throw new ApiError(401, 'Nenhum token fornecido');
    }

    const parts = authHeader.split(/\s+/);
    if (parts.length !== 2) {
      throw new ApiError(401, 'Erro no formato do token');
    }

    const token = parts[1].trim();
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw new ApiError(401, 'Usuário não encontrado');
    }

    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Token inválido ou expirado'));
  }
}
