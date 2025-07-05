import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateUserAsPorteiro, updateUserAsAdm } from '../backend/controllers/authFunctions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id, as } = req.query;

  if (!id || Array.isArray(id)) return res.status(400).json({ message: 'ID inválido.' });
  if (req.method !== 'PUT' && req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Método não permitido.' });
  }

  try {
    const idNum = parseInt(id as string, 10);

    const updatedUser =
      as === 'porteiro'
        ? await updateUserAsPorteiro(idNum, req.body)
        : await updateUserAsAdm(idNum, req.body);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado para atualização.' });
    }

    return res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error.message || error);
    return res.status(error.status || 500).json({ message: error.message || 'Erro interno.' });
  }
}
