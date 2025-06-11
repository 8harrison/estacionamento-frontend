import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('administrador' | 'porteiro')[];
}

// Componente para proteger rotas que exigem autenticação
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Enquanto verifica a autenticação, mostra um indicador de carregamento
  if (loading) {
    return <div>Carregando...</div>;
  }

  // Se não estiver autenticado, redireciona para o login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se houver roles permitidas e o usuário não tiver uma delas, redireciona para acesso negado
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  // Se estiver autenticado e tiver permissão, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
