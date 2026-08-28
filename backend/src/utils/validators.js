import { ApiError } from './ApiError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterInput({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, 'É necessário fornecer um e-mail e uma senha');
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    throw new ApiError(400, 'E-mail inválido');
  }
  if (typeof password !== 'string' || password.length < 8) {
    throw new ApiError(400, 'A senha deve ter pelo menos 8 caracteres');
  }
}

export function validateLoginInput({ email, password }) {
  if (!email || !password) {
    throw new ApiError(400, 'É necessário fornecer um e-mail e uma senha');
  }
}

export function validateTodoText(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new ApiError(400, 'O texto é obrigatório');
  }
  if (text.length > 500) {
    throw new ApiError(400, 'O texto deve ter no máximo 500 caracteres');
  }
}

export function validateDueDate(dueDate) {
  if (dueDate === undefined || dueDate === null || dueDate === '') return null;
  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, 'dueDate inválida');
  }
  return parsed;
}

export function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(String(id));
}
