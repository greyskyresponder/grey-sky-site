import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'grey-sky-backend',
    timestamp: new Date().toISOString(),
  });
});
