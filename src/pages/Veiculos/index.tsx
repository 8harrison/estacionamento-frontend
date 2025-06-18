import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./Veiculos.module.css";
import { useData } from "../../hooks/useData";
import type { Veiculo } from "../../types";

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
      <div className={styles.actionsContainer}>
        <form className={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar por placa ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Buscar
          </button>
        </form>

        <button
          className={styles.addButton}
          onClick={() => navigate("/veiculos/novo")}
        >
          Adicionar Veículo
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando veículos...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : veiculos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum veículo encontrado.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Modelo</th>
                <th>Cor</th>
                <th>Proprietário</th>
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {veiculoMemo.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.placa}</td>
                  <td>{veiculo.modelo}</td>
                  <td>{veiculo.cor}</td>
                  <td>
                    {veiculo.aluno?.nome || veiculo.docente?.nome || "N/A"}
                  </td>
                  <td>{veiculo.aluno ? "Aluno" : "Docente"}</td>
                  <td>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleViewDetails(veiculo.id)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </MainLayout>
  );
};

export default Veiculos;
