import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./Estacionamento.module.css";
import { useData } from "../../hooks/useData";
import type { Registro } from "../../types";

const Estacionamento = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "ativos" | "finalizados"
  >("todos");
  const navigate = useNavigate();
  const { registros, error, loading } = useData();

  useEffect(() => {
   
  }, [loading]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleViewDetails = (id: string) => {
    navigate(`/estacionamento/${id}`);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR");
  };

  const registroMemo = useMemo<Registro[]>(() => {
    return registros.filter((registro) => {
      // Filtro por termo de busca (placa ou proprietário)
      const matchesSearch =
        searchTerm === "" ||
        registro.veiculo.placa
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        registro.veiculo.aluno?.nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        registro.veiculo.docente?.nome
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filtro por status
      const dataSaida = !!registro["data_saida"];
      const matchesStatus =
        filtroStatus === "todos" ||
        (filtroStatus === "ativos" && !dataSaida) ||
        (filtroStatus === "finalizados" && dataSaida);

      return matchesSearch && matchesStatus;
    });
  }, [filtroStatus, searchTerm, loading]);

  return (
    <MainLayout title="Gerenciamento de Estacionamento">
      <div className={styles.actionsContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar por placa ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={filtroStatus}
            onChange={(e) =>
              setFiltroStatus(
                e.target.value as "todos" | "ativos" | "finalizados"
              )
            }
            className={styles.filterSelect}
          >
            <option value="todos">Todos os registros</option>
            <option value="ativos">Veículos estacionados</option>
            <option value="finalizados">Registros finalizados</option>
          </select>

          <button type="submit" className={styles.searchButton}>
            Filtrar
          </button>
        </form>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando registros...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : registroMemo.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Placa</th>
                <th>Veículo</th>
                <th>Proprietário</th>
                <th>Vaga</th>
                <th>Entrada</th>
                <th>Saída</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {registroMemo.length > 0 &&
                registroMemo.map((registro) => (
                  <tr key={registro.id}>
                    <td>{registro.veiculo.placa || ""}</td>
                    <td>
                      {registro.veiculo.modelo || ""}{" "}
                      {registro.veiculo.cor || ""}
                    </td>
                    <td>
                      {registro.veiculo.aluno?.nome ||
                        registro.veiculo.docente?.nome ||
                        ""}
                    </td>
                    <td>
                      {registro.vaga.numero || ""} {registro.vaga.setor || ""}
                    </td>
                    <td>{formatarData(registro["data_entrada"])}</td>
                    <td>
                      {registro["data_saida"]
                        ? formatarData(registro["data_saida"])
                        : "-"}
                    </td>
                    <td>
                      <div className={styles.actionButtonsContainer}>
                        <button
                          className={styles.actionButton}
                          onClick={() => handleViewDetails(registro.id)}
                        >
                          Detalhes
                        </button>
                      </div>
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

export default Estacionamento;
