import { Router } from 'express';
import { dbState } from '../config/db.js';

const router = Router();

const STATE_LABELS = ['disconnected', 'connected', 'connecting', 'disconnecting'];

router.get('/', (req, res) => {
  const state = dbState();
  const healthy = state === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    mongo: STATE_LABELS[state] ?? 'unknown',
  });
});

export default router;
