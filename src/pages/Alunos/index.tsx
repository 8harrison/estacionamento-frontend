import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./Alunos.module.css";
import { useData } from "../../hooks/useData";
import type { Aluno } from "../../types";
import SearchActions from "../../components/SearchActions/SearchActions";
import InfoList from "../../components/InfoCard/InfoList";

const Alunos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtredAlunos, setFiltredAlunos] = useState<Aluno[]>([]);
  const navigate = useNavigate();
  const { alunos, loading, error } = useData();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }

    setFiltredAlunos(
      alunos.filter(
        (aluno) =>
          aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const handleViewDetails = (id: string) => {
    navigate(`/alunos/${id}`, { state: "message" });
  };

  useEffect(() => {
    setFiltredAlunos(
      alunos.filter(
        (aluno) =>
          aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [alunos]);

  return (
    <MainLayout title="Gerenciamento de Alunos">
      <SearchActions
        searchPlaceholder="Buscar por nome ou matrícula..."
        onAdd={() => navigate("/alunos/novo")}
        addButtonLabel="Adicionar Aluno"
        onSearch={handleSearch}
        onSearchTermChange={(e) => setSearchTerm(e)}
        searchTerm={searchTerm}
      />
      {loading ? (
        <div className={styles.loading}>Carregando alunos...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : filtredAlunos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <InfoList<Aluno>
          data={filtredAlunos}
          infoCard={{
            title: "nome",
            subtitle: "matricula",
            info: [
              { label: "Turno", value: "turno" },
              { label: "Veículos", value: (a) => a.veiculos.length },
            ],
            actions: (aluno) => (
              <button
                onClick={() => handleViewDetails(aluno.id)}
                className={styles.actionButton}
              >
                Detalhes
              </button>
            ),
          }}
        />
      )}
    </MainLayout>
  );
};

export default Alunos;
