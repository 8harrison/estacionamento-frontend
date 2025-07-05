import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import Modal from "../../components/Modal/Modal";
import api from "../../services/api";
import styles from "./VeiculoForm.module.css";
import type { Aluno, Docente, Veiculo } from "../../types";
import { useData } from "../../hooks/useData";
import { MeuErro } from "../../customError";
interface FormData {
  placa: string;
  modelo: string;
  cor: string;
  proprietarioTipo: "aluno" | "docente";
  alunoId?: string;
  docenteId?: string;
}

const VeiculoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "novo";

  const [formData, setFormData] = useState<FormData>({
    placa: "",
    modelo: "",
    cor: "",
    proprietarioTipo: "aluno",
  });

  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);

  const {
    alunos,
    docentes,
    setVeiculos,
    veiculos,
    alunosCallback,
    docentesCallback,
  } = useData();

  useEffect(() => {
    if (isEditing) {
      fetchVeiculoData();
    }
  }, [id]);

  const propritarioMemo = useMemo<Aluno[] | Docente[]>(() => {
    if (formData.proprietarioTipo === "aluno") {
      return alunos.filter((aluno) => {
        return (
          searchTerm === "" ||
          aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    } else {
      return docentes.filter((docente) => {
        return (
          searchTerm === "" ||
          docente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          docente.matricula.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
  }, [formData.proprietarioTipo, searchTerm, alunos, docentes]);

  const fetchVeiculoData = async () => {
    setLoading(true);
    const veiculo = veiculos.find((veiculo) => veiculo.id == id);
    setFormData({
      placa: veiculo?.placa || "",
      modelo: veiculo?.modelo || "",
      cor: veiculo?.cor || "",
      proprietarioTipo: veiculo?.aluno ? "aluno" : "docente",
    });

    setSearchTerm(
      `${veiculo?.aluno?.nome || veiculo?.docente?.nome} - Matrícula: ${
        veiculo?.aluno?.matricula || veiculo?.docente?.matricula
      }`
    );

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

  const handleProprietarioTipoChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const tipo = e.target.value as "aluno" | "docente";
    setFormData((prev) => ({
      ...prev,
      proprietarioTipo: tipo,
      proprietarioId: 0, // Resetar o ID quando mudar o tipo
    }));
    setSearchTerm("");
  };

  const validateForm = () => {
    if (!formData.placa.trim()) {
      setError("A placa é obrigatória.");
      return false;
    }
    if (!(formData.placa.trim().length === 7)) {
      setError("A placa deve ter 7 caracteres.");
      return false;
    }

    const regex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    
    if (!regex.test(formData.placa.trim())) {
      setError("A placa está em um formato inválido.");
      return false;
    }

    if (!formData.modelo.trim()) {
      setError("O modelo é obrigatório.");
      return false;
    }

    if (!formData.cor.trim()) {
      setError("A cor é obrigatória.");
      return false;
    }

    if(!searchTerm){
      setError("É necessário inserir um proprietário.")
      return false
    }
    return true;
  };

  const updateVeiculo = async (payload: Partial<Veiculo>) => {
    setVeiculos((prev) => {
      return prev.map((veiculo) => {
        if (veiculo.id == id) {
          veiculo = { ...veiculo, ...payload };
        }
        return veiculo;
      });
    });
    api.put(`/veiculos/${id}`, payload);
  };

  const createVeiculo = async (payload: Partial<Veiculo>) => {
    const newVeiculo = await api.post("/veiculos", payload);
    setVeiculos((prev) => [...prev, newVeiculo.data]);
    alunosCallback();
    docentesCallback();
  };

  const deleteVeiculo = async () => {
    setVeiculos((prev) => {
      return prev.filter((veiculo) => veiculo.id !== id);
    });
    await api.delete(`/veiculos/${id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = { ...formData };
      payload.placa = payload.placa.toUpperCase();

      if (isEditing) {
        await updateVeiculo(payload);
      } else {
        await createVeiculo(payload);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate("/veiculos");
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
      await deleteVeiculo();
      setShowConfirmModal(false);
      navigate("/veiculos");
    } catch (err) {
      console.error("Erro ao excluir veículo:", err);
      setError(
        "Não foi possível excluir o veículo. Tente novamente mais tarde."
      );
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionar = (propri: Aluno | Docente) => {
    if (formData.proprietarioTipo === "aluno") {
      setFormData((prev) => ({ ...prev, alunoId: propri.id }));
    } else {
      setFormData((prev) => ({ ...prev, docenteId: propri.id }));
    }
    setSearchTerm(`${propri.nome} - Matrícula: ${propri.matricula}`);
  };

  if (loading && isEditing) {
    return (
      <MainLayout title={isEditing ? "Editar Veículo" : "Novo Veículo"}>
        <div className={styles.loading}>Carregando dados...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEditing ? "Editar Veículo" : "Novo Veículo"}>
      {submitSuccess ? (
        <div className={styles.successMessage}>
          Veículo {isEditing ? "atualizado" : "cadastrado"} com sucesso!
          Redirecionando...
        </div>
      ) : (
        <>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="placa" className={styles.label}>
                  Placa
                </label>
                <input
                  type="text"
                  id="placa"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Placa do veículo"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="modelo" className={styles.label}>
                  Modelo
                </label>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Modelo do veículo"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="cor" className={styles.label}>
                  Cor
                </label>
                <input
                  type="text"
                  id="cor"
                  name="cor"
                  value={formData.cor}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Cor do veículo"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="proprietarioTipo" className={styles.label}>
                  Tipo de Proprietário
                </label>
                <select
                  id="proprietarioTipo"
                  name="proprietarioTipo"
                  value={formData.proprietarioTipo}
                  onChange={handleProprietarioTipoChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="aluno">Aluno</option>
                  <option value="docente">Docente</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="proprietarioId" className={styles.label}>
                  Proprietário
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.select}
                />
                {searchTerm && propritarioMemo.length > 0 && (
                  <ul className={styles.autocompleteSuggestions}>
                    {propritarioMemo.map((propri) => (
                      <li
                        key={propri.id}
                        value={propri.id}
                        className={styles.autocompleteItem}
                        onClick={() => handleSelecionar(propri)}
                      >
                        {propri.nome} - Matrícula: {propri.matricula}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate("/veiculos")}
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
              Tem certeza que deseja excluir este veículo? Esta ação não pode
              ser desfeita.
            </p>
          </Modal>
        </>
      )}
    </MainLayout>
  );
};

export default VeiculoForm;
