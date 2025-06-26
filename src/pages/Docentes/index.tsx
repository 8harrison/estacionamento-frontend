import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./Docentes.module.css";
import { useData } from "../../hooks/useData";
import type { Docente } from "../../types";
import SearchActions from "../../components/SearchActions/SearchActions";
import InfoList from "../../components/InfoCard/InfoList";

const Docentes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [filteredDocentes, setFilteredDocentes] = useState<Docente[]>([]);
  const { docentes, loading, error } = useData();

  useEffect(() => {
    setFilteredDocentes(docentes);
  }, [loading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }
    setFilteredDocentes(
      searchTerm
        ? docentes.filter(
            (docente) =>
              docente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
              docente.matricula
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              docente.departamento
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
          )
        : docentes
    );
  };

  const handleViewDetails = (id: string) => {
    navigate(`/docentes/${id}`);
  };

  return (
    <MainLayout title="Gerenciamento de Docentes">
      <SearchActions
        searchPlaceholder="Buscar por nome, matrícula ou departamento..."
        onAdd={() => navigate("/docentes/novo")}
        addButtonLabel="Adicionar Docente"
        onSearch={handleSearch}
        onSearchTermChange={(e) => setSearchTerm(e)}
        searchTerm={searchTerm}
      />

      {loading ? (
        <div className={styles.loading}>Carregando docentes...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : filteredDocentes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum docente encontrado.</p>
        </div>
      ) : (
        <InfoList<Docente>
          data={filteredDocentes}
          infoCard={{
            title: "nome",
            subtitle: "matricula",
            info: [
              { label: "Departamento", value: "departamento" },
              { label: "Veículos", value: (a) => a.veiculos.length },
            ],
            actions: (docente) => (
              <button
                className={styles.actionButton}
                onClick={() => handleViewDetails(docente.id)}
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

export default Docentes;
