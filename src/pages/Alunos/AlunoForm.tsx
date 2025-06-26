import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Modal from "../../components/Modal/Modal";
import api from "../../services/api";
import styles from "./AlunoForm.module.css";
import { useData } from "../../hooks/useData";
import { MeuErro } from "../../customError";
import type { Aluno } from "../../types";
interface FormData {
  nome: string;
  matricula: string;
  turno: string;
  email: string;
  telefone: string;
}

const AlunoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "novo";

  const [formData, setFormData] = useState<FormData>({
    nome: "",
    matricula: "",
    turno: "Manhã",
    email: "",
    telefone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { alunos, setAlunos } = useData();
  const [aluno, setAluno] = useState<Aluno>();

  useEffect(() => {
    if (isEditing) {
      fetchAlunoData();
    }
  }, [id]);

  const fetchAlunoData = async () => {
    setLoading(true);
    const aluno = alunos.find((aluno) => aluno.id == id);
    console.log(aluno);
    setAluno(aluno);
    setFormData({
      nome: aluno?.nome || "",
      matricula: aluno?.matricula || "",
      turno: aluno?.turno || "Manhã",
      email: aluno?.email || "",
      telefone: aluno?.telefone || "",
    });
    setLoading(false);
    setError("");
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

    if (!formData.matricula.trim()) {
      setError("A matrícula é obrigatória.");
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

    return true;
  };

  const updateAluno = async () => {
    setAlunos((prev) =>
      prev.map((aluno) => {
        if (aluno.id == id) {
          aluno = { ...aluno, ...formData };
        }
        return aluno;
      })
    );
    api.put(`/alunos/${id}`, formData);
  };

  const createAluno = async () => {
    const newAluno = await api.post("/alunos", formData);
    setAlunos((prev) => [...prev, newAluno.data]);
  };

  const deleteAluno = async () => {
    console.log(id);
    setAlunos((prev) => {
      return prev.filter((aluno) => {
        return aluno.id != id;
      });
    });
    api.delete(`/alunos/${id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isEditing) {
        await updateAluno();
      } else {
        await createAluno();
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/alunos");
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof MeuErro)
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
      await deleteAluno();
      setShowConfirmModal(false);
      navigate("/alunos");
    } catch (err) {
      console.error("Erro ao excluir aluno:", err);
      setError("Não foi possível excluir o aluno. Tente novamente mais tarde.");
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <MainLayout title={isEditing ? "Editar Aluno" : "Novo Aluno"}>
        <div className={styles.loading}>Carregando dados do aluno...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEditing ? "Editar Aluno" : "Novo Aluno"}>
      {submitSuccess ? (
        <div className={styles.successMessage}>
          Aluno {isEditing ? "atualizado" : "cadastrado"} com sucesso!
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
                <label htmlFor="matricula" className={styles.label}>
                  Matrícula
                </label>
                <input
                  type="text"
                  id="matricula"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Número de matrícula"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="turno" className={styles.label}>
                  Turno
                </label>
                <select
                  id="turno"
                  name="turno"
                  value={formData.turno}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="Manhã">Manhã</option>
                  <option value="Tarde">Tarde</option>
                  <option value="Noite">Noite</option>
                  <option value="Integral">Integral</option>
                </select>
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
                  placeholder="Email de contato"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="telefone" className={styles.label}>
                  Telefone
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Telefone de contato"
                  disabled={loading}
                />
              </div>

              {isEditing && aluno && aluno!.veiculos!.length > 0 && (
                <div className={styles.veiculosContainer}>
                  <h3 className={styles.subtitulo}>Veículos Cadastrados</h3>
                  <ul className={styles.veiculosLista}>
                    {aluno!.veiculos!.map((veiculo) => (
                      <li key={veiculo.id} className={styles.veiculoItem}>
                        <strong>Placa:</strong> {veiculo.placa} —{" "}
                        <strong>Modelo:</strong> {veiculo.modelo}{" "}
                        {veiculo.cor ? `(${veiculo.cor})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate("/alunos")}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>

                {isEditing && (
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
              Tem certeza que deseja excluir este aluno? Esta ação não pode ser
              desfeita.
            </p>
          </Modal>
        </>
      )}
    </MainLayout>
  );
};

export default AlunoForm;
