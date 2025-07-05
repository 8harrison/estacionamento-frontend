import type { VercelRequest, VercelResponse } from '@vercel/node';
import { login } from '../backend/controllers/authFunctions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido.' });

  try {
    const result = await login(req.body);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Erro no login:', error.message || error);
    return res.status(error.status || 500).json({ message: error.message || 'Erro interno.' });
  }
}
