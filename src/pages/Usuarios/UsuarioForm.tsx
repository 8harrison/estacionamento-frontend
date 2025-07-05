import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Modal from "../../components/Modal/Modal";
import api from "../../services/api";
import styles from "./UsuarioForm.module.css";
import { useAuth } from "../../hooks/useAuth";
import { AxiosError } from "axios";
import type { User } from "../../contexts/AuthContext";
import {useLocation} from 'react-router-dom'

interface FormData {
  nome: string;
  email: string;
  senha?: string;
  confirmarSenha?: string;
  role: "administrador" | "porteiro" | "master";
}

const UsuarioForm = () => {
  const location = useLocation()
  const navigate = useNavigate();
  const { id } = location.state;
  const isEditing = id !== "novo";
  const { usuarios, user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    role: "porteiro",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [usuario, setUsuario] = useState<User>();

  useEffect(() => {
    if (isEditing) {
      fetchUsuarioData();
    }
  }, [id]);

  const fetchUsuarioData = async () => {
    setLoading(true);
    const usuario = usuarios.find((usuario) => usuario.id == id);
    setUsuario(usuario);

    setFormData({
      nome: usuario?.nome || "",
      email: usuario?.email || "",
      senha: "",
      confirmarSenha: "",
      role: usuario?.role || "porteiro",
    });

    setError("");
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      setError("O nome é obrigatório.");
      return false;
    }

    if (!formData.email.trim()) {
      setError("O email é obrigatório.");
      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Por favor, insira um email válido.");
      return false;
    }

    // Validação de senha apenas para novos usuários ou quando a senha for preenchida
    if (!isEditing || formData.senha) {
      if (!isEditing && !formData.senha) {
        setError("A senha é obrigatória para novos usuários.");
        return false;
      }

      if (formData.senha)
        if (formData.senha.length < 6) {
          setError("A senha deve ter pelo menos 6 caracteres.");
          return false;
        }

      if (formData.senha !== formData.confirmarSenha) {
        setError("As senhas não coincidem.");
        return false;
      }
    }

    return true;
  };

  const updateUser = async () => {
    if (usuario?.role === "porteiro") {
      await api.put(`/auth/usuarios/porteiros/${id}`, formData);
    } else if (usuario?.role === "administrador") {
      await api.put(`/auth/usuarios/administradores/${id}`, formData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      delete formData.confirmarSenha;

      if (isEditing) {
        await updateUser();
      } else {
        await api.post("/auth/register", formData);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/usuarios");
      }, 1500);
    } catch (err) {
      console.error("Erro ao salvar usuário:", err);
      if (err instanceof AxiosError)
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(
            "Ocorreu um erro ao salvar os dados. Tente novamente mais tarde."
          );
        }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/usuarios/${id}`);
      setShowConfirmModal(false);
      navigate("/usuarios");
    } catch (err) {
      console.error("Erro ao excluir usuário:", err);
      if (err instanceof AxiosError)
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(
            "Não foi possível excluir o usuário. Tente novamente mais tarde."
          );
        }
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <MainLayout title={isEditing ? "Editar Usuário" : "Novo Usuário"}>
        <div className={styles.loading}>Carregando dados do usuário...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEditing ? "Editar Usuário" : "Novo Usuário"}>
      {submitSuccess ? (
        <div className={styles.successMessage}>
          Usuário {isEditing ? "atualizado" : "cadastrado"} com sucesso!
          Redirecionando...
        </div>
      ) : (
        <>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="nome" className={styles.label}>
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Nome completo"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Email"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="senha" className={styles.label}>
                  {isEditing
                    ? "Nova Senha (deixe em branco para manter a atual)"
                    : "Senha"}
                </label>
                <input
                  type="password"
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder={isEditing ? "Nova senha (opcional)" : "Senha"}
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmarSenha" className={styles.label}>
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Confirme a senha"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="role" className={styles.label}>
                  Perfil
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading}
                >
                  {user?.role === "master" && (
                    <option value="administrador">Administrador</option>
                  )}

                  <option value="porteiro">Porteiro</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate("/usuarios")}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>

                {isEditing && user?.role === "master" && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className={styles.deleteButton}
                    disabled={loading}
                  >
                    Excluir
                  </button>
                )}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading
                    ? "Salvando..."
                    : isEditing
                    ? "Atualizar"
                    : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>

          <Modal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            title="Confirmar Exclusão"
            footer={
              <>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className={styles.deleteButton}
                  disabled={loading}
                >
                  {loading ? "Excluindo..." : "Confirmar Exclusão"}
                </button>
              </>
            }
          >
            <p>
              Tem certeza que deseja excluir este usuário? Esta ação não pode
              ser desfeita.
            </p>
          </Modal>
        </>
      )}
    </MainLayout>
  );
};

export default UsuarioForm;
