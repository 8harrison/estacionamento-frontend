import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  return res.status(200).json({
    message: '🚀 API Estacionamento está operacional!',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
}
