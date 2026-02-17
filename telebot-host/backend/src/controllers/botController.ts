import { Request, Response } from 'express';
import { pool } from '../index';
import dockerService from '../services/dockerService';
import fs from 'fs';

export async function listBots(req: any, res: Response) {
  const userId = req.user.id;
  const result = await pool.query('SELECT id,user_id,bot_token,container_id,status,created_at FROM bots WHERE user_id=$1', [userId]);
  res.json(result.rows.map((r: any) => ({ id: r.id, status: r.status, created_at: r.created_at })));
}

export async function createBot(req: any, res: Response) {
  const userId = req.user.id;
  const { bot_token } = req.body;
  if (!bot_token) return res.status(400).json({ message: 'Missing bot_token' });
  const result = await pool.query('INSERT INTO bots(user_id,bot_token,status) VALUES($1,$2,$3) RETURNING id,created_at', [userId, bot_token, 'stopped']);
  res.json({ id: result.rows[0].id, created_at: result.rows[0].created_at });
}

export async function startBot(req: any, res: Response) {
  const userId = req.user.id;
  const botId = req.params.id;
  const botRow = await pool.query('SELECT * FROM bots WHERE id=$1 AND user_id=$2', [botId, userId]);
  if (!botRow.rows.length) return res.status(404).json({ message: 'Bot not found' });
  const bot = botRow.rows[0];
  try {
    const container = await dockerService.createContainer({ userId, botId, token: bot.bot_token });
    await pool.query('UPDATE bots SET container_id=$1,status=$2 WHERE id=$3', [container.id, 'running', botId]);
    res.json({ message: 'Started', containerId: container.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to start' });
  }
}

export async function stopBot(req: any, res: Response) {
  const userId = req.user.id;
  const botId = req.params.id;
  const botRow = await pool.query('SELECT * FROM bots WHERE id=$1 AND user_id=$2', [botId, userId]);
  if (!botRow.rows.length) return res.status(404).json({ message: 'Bot not found' });
  const bot = botRow.rows[0];
  try {
    if (!bot.container_id) return res.status(400).json({ message: 'No container' });
    await dockerService.stopAndRemoveContainer(bot.container_id);
    await pool.query('UPDATE bots SET container_id=$1,status=$2 WHERE id=$3', [null, 'stopped', botId]);
    res.json({ message: 'Stopped' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to stop' });
  }
}

export async function deleteBot(req: any, res: Response) {
  const userId = req.user.id;
  const botId = req.params.id;
  const botRow = await pool.query('SELECT * FROM bots WHERE id=$1 AND user_id=$2', [botId, userId]);
  if (!botRow.rows.length) return res.status(404).json({ message: 'Bot not found' });
  const bot = botRow.rows[0];
  try {
    if (bot.container_id) {
      await dockerService.stopAndRemoveContainer(bot.container_id);
    }
    await pool.query('DELETE FROM bots WHERE id=$1', [botId]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete' });
  }
}

export async function getLogs(req: any, res: Response) {
  const userId = req.user.id;
  const botId = req.params.id;
  const botRow = await pool.query('SELECT * FROM bots WHERE id=$1 AND user_id=$2', [botId, userId]);
  if (!botRow.rows.length) return res.status(404).json({ message: 'Bot not found' });
  const bot = botRow.rows[0];
  try {
    if (!bot.container_id) return res.status(400).json({ message: 'No container' });
    const logs = await dockerService.getContainerLogs(bot.container_id);
    res.send(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get logs' });
  }
}
