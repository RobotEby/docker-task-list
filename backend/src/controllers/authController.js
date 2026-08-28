import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { validateRegisterInput, validateLoginInput } from '../utils/validators.js';

function signToken(userId, expiresIn) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn });
}

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    validateRegisterInput({ email, password });

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(409, 'E-mail já registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email: normalizedEmail, password: hashedPassword });

    const token = signToken(user._id, env.jwtExpiresIn);

    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;
    validateLoginInput({ email, password });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApiError(401, 'Credenciais inválidas');
    }

    const expiresIn = rememberMe ? env.jwtExpiresInRemember : env.jwtExpiresIn;
    const token = signToken(user._id, expiresIn);

    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: { id: req.user._id, email: req.user.email } });
}
