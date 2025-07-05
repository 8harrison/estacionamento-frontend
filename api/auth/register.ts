import type { VercelRequest, VercelResponse } from '@vercel/node';
import { register } from '../backend/controllers/authFunctions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Método não permitido.' });

  try {
    const novoUsuario = await register(req.body);
    return res.status(201).json(novoUsuario);
  } catch (error: any) {
    console.error('Erro no registro:', error.message || error);
    return res.status(error.status || 500).json({ message: error.message || 'Erro interno.' });
  }
}
