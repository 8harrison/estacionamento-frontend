import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Este código é à prova de erros e apenas envia uma mensagem de sucesso.
  res.status(200).json({ message: 'A rota /api/index.ts funcionou!' });
}