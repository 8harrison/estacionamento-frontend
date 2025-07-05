import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllUsers, getAllPorteiros } from '../backend/controllers/authFunctions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Método não permitido.' });

  try {
    const usuarios = req.query.porteiros === 'true'
      ? await getAllPorteiros()
      : await getAllUsers();

    return res.status(200).json(usuarios);
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error.message || error);
    return res.status(500).json({ message: 'Erro interno.' });
  }
}
