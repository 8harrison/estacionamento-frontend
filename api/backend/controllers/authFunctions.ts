import { AuthService } from '../services/AuthService';
import type { UsuarioCreationAttributes } from '../models/Usuario';

const authService = new AuthService();

export async function login(data: { email: string; senha: string }) {
  const { email, senha } = data;

  if (!email || !senha) {
    throw { status: 400, message: 'Email e senha são obrigatórios.' };
  }

  const result = await authService.login(email, senha);

  if (!result) {
    throw { status: 401, message: 'Credenciais inválidas ou usuário inativo.' };
  }

  return result;
}

export async function register(userData: UsuarioCreationAttributes) {
  if (!userData.nome || !userData.email || !userData.senha || !userData.role) {
    throw { status: 400, message: 'Nome, email, senha e role são obrigatórios.' };
  }

  return await authService.registerUser(userData);
}

export async function getAllUsers() {
  return await authService.getAllUsers();
}

export async function getAllPorteiros() {
  return await authService.getAllPorteiros();
}

export async function updateUserAsPorteiro(id: number, data: any) {
  return await authService.updateUserAsPorteiro(id, data);
}

export async function updateUserAsAdm(id: number, data: any) {
  return await authService.updateUserAsAdm(id, data);
}
