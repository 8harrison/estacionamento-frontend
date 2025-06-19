import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import api from "../services/api";
import { AxiosError } from "axios";

// Definindo os tipos
interface User {
  id: number;
  nome: string;
  email: string;
  role: "administrador" | "porteiro";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Criando o contexto de autenticação
export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

// Provider do contexto de autenticação
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Verificar se o usuário já está autenticado ao carregar a aplicação
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Função de login
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await api.post("/auth/login", {
        email,
        senha: password,
      });
      const { token, usuario } = result.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(usuario));

      setToken(token);
      setUser(usuario);
    } catch (err) {
      setError('Falha na autenticação. Verifique suas credenciais.')    
      if (err instanceof AxiosError)
        console.error("Erro ao fazer login:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // Valores a serem disponibilizados pelo contexto
  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === "administrador",
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
