import express from 'express';
import { authenticate, AuthRequest } from '../middleware/authMiddleware';
import { createBot, listBots, startBot, stopBot, deleteBot, getLogs } from '../controllers/botController';

const router = express.Router();

router.use(authenticate);

router.get('/', listBots);
router.post('/', createBot);
router.post('/:id/start', startBot);
router.post('/:id/stop', stopBot);
router.delete('/:id', deleteBot);
router.get('/:id/logs', getLogs);

export default router;
