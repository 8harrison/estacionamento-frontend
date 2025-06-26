import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./Veiculos.module.css";
import { useData } from "../../hooks/useData";
import type { Veiculo } from "../../types";
import SearchActions from "../../components/SearchActions/SearchActions";
import InfoList from "../../components/InfoCard/InfoList";

const Veiculos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { veiculos, loading, error } = useData();

  const veiculoMemo = useMemo<Veiculo[]>(() => {
    return veiculos.filter((veiculo) => {
      return (
        searchTerm === "" ||
        veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        veiculo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [loading, searchTerm]);

  const handleViewDetails = (id: string) => {
    navigate(`/veiculos/${id}`);
  };

  return (
    <MainLayout title="Gerenciamento de Veículos">
      <SearchActions
        searchPlaceholder="Buscar por placa ou modelo..."
        onAdd={() => navigate("/veiculos/novo")}
        addButtonLabel="Adicionar Veículo"
        onSearchTermChange={(e) => setSearchTerm(e)}
        searchTerm={searchTerm}
        showSearchButton={false}
      />
      {loading ? (
        <div className={styles.loading}>Carregando veículos...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : veiculos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum veículo encontrado.</p>
        </div>
      ) : (
        <InfoList<Veiculo>
          data={veiculoMemo}
          infoCard={{
            title: "modelo",
            subtitle: "placa",
            info: [
              {
                label: "Proprietário",
                value: (a) => a.aluno?.nome || a.docente?.nome || "N/A",
              },
              { label: "Cor", value: "cor" },
              { label: "Tipo", value: (a) => (a.aluno ? "Aluno" : "Docente") },
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

export default Veiculos;
