import { ApiError } from '../utils/ApiError.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err && err.code === 11000) {
    return res.status(409).json({ error: 'E-mail já registrado' });
  }

  if (err && err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  console.error('[unhandled error]', err);
  return res.status(500).json({ error: 'Erro interno do servidor' });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Rota não encontrada' });
}
