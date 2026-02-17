import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Pool } from 'pg';
import authRoutes from './routes/auth';
import botRoutes from './routes/bots';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/telebotdb';
export const pool = new Pool({ connectionString });

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bots (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      bot_token TEXT NOT NULL,
      container_id TEXT,
      status TEXT DEFAULT 'stopped',
      created_at TIMESTAMP DEFAULT now()
    );
  `);
}

app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

initDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('DB init failed', err);
    process.exit(1);
  });
