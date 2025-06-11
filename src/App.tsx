import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alunos from "./pages/Alunos";
import Docentes from "./pages/Docentes";
import Veiculos from "./pages/Veiculos";
import Vagas from "./pages/Vagas";
import Estacionamento from "./pages/Estacionamento";
import Usuarios from "./pages/Usuarios";
import AccessDenied from "./pages/AccessDenied";

import "./App.css";
import VeiculoForm from "./pages/Veiculos/VeiculoForm";
import AlunoForm from "./pages/Alunos/AlunoForm";
import DocenteForm from "./pages/Docentes/DocenteForm";
import VagaForm from "./pages/Vagas/VagaForm";
import { DataProvider } from "./contexts/DataContext";

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            {/* Rota pública */}
            <Route path="/login" element={<Login />} />

            {/* Rota de acesso negado */}
            <Route path="/acesso-negado" element={<AccessDenied />} />

            {/* Rotas protegidas - requerem autenticação */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/alunos/*"
              element={
                <ProtectedRoute>
                  <Alunos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/alunos/:id"
              element={
                <ProtectedRoute>
                  <AlunoForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/docentes/*"
              element={
                <ProtectedRoute>
                  <Docentes />
                </ProtectedRoute>
              }
            />

            <Route
              path="/docentes/:id"
              element={
                <ProtectedRoute>
                  <DocenteForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/veiculos/*"
              element={
                <ProtectedRoute>
                  <Veiculos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/veiculos/:id"
              element={
                <ProtectedRoute>
                  <VeiculoForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vagas/*"
              element={
                <ProtectedRoute>
                  <Vagas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vagas/:id"
              element={
                <ProtectedRoute>
                  <VagaForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/estacionamento/*"
              element={
                <ProtectedRoute>
                  <Estacionamento />
                </ProtectedRoute>
              }
            />

            <Route
              path="/estacionamento/*"
              element={
                <ProtectedRoute>
                  <Estacionamento />
                </ProtectedRoute>
              }
            />

            {/* Rota protegida apenas para administradores */}
            <Route
              path="/usuarios/*"
              element={
                <ProtectedRoute allowedRoles={["administrador"]}>
                  <Usuarios />
                </ProtectedRoute>
              }
            />

            {/* Redirecionar raiz para dashboard se autenticado, ou login se não */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Rota para qualquer outro caminho não definido */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
