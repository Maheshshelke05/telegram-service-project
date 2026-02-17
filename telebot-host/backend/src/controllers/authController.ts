import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../index';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function signup(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  const hashed = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query('INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id,email,created_at', [email, hashed]);
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token });
  } catch (err: any) {
    if (err.code === '23505') return res.status(400).json({ message: 'Email already exists' });
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}
