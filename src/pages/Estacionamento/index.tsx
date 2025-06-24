import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./Estacionamento.module.css";
import { useData } from "../../hooks/useData";
import type { Registro } from "../../types";
import InfoList from "../../components/InfoCard/InfoList";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Estacionamento = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "todos" | "ativos" | "finalizados"
  >("todos");
  const navigate = useNavigate();
  const { registros, error, loading } = useData();

  const exportToExcel = () => {
    // Mapeia os registros para um array plano
    const dataToExport = registroMemo.map((r) => ({
      Placa: r.veiculo.placa,
      Modelo: r.veiculo.modelo,
      Cor: r.veiculo.cor,
      Proprietário: r.veiculo.aluno?.nome || r.veiculo.docente?.nome || "N/A",
      Vaga: `${r.vaga.numero} - ${r.vaga.setor || ''}`,
      Entrada: formatarData(r["data_entrada"]),
      Saída: r["data_saida"] ? formatarData(r["data_saida"]) : "Em andamento",
    }));

    // Cria a planilha
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

    // Gera o arquivo
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Salva o arquivo
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `registros-estacionamento.xlsx`);
  };

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
  }, [filtroStatus, searchTerm, loading, registros]);

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
          <button onClick={exportToExcel} className={styles.exportButton}>
          Baixar Excel
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
        <InfoList<Registro>
          data={registroMemo}
          infoCard={{
            title: (a) => a.veiculo.modelo,
            subtitle: (a) => a.veiculo.placa,
            info: [
              { label: "VAGA", value: (a) => a.vaga.numero },
              {
                label: "PROPRIETÁRIO",
                value: (a) =>
                  a.veiculo.aluno?.nome || a.veiculo.docente?.nome || "N/A",
              },
              {
                label: "ENTRADA",
                value: (a) => formatarData(a["data_entrada"]),
              },
              {
                label: "SAÍDA",
                value: (a) =>
                  a["data_saida"]
                    ? formatarData(a["data_saida"])
                    : "Em andamento",
              },
            ],
            actions: (registro) => (
              <button
                className={styles.actionButton}
                onClick={() => handleViewDetails(registro.id)}
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

export default Estacionamento;
