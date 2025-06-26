import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import api from "../../services/api";
import styles from "./Vagas.module.css";
import { useData } from "../../hooks/useData";
import { StatusVaga, type Vaga, TipoVaga, type Veiculo } from "../../types";
import Modal from "../../components/Modal/Modal";
import OcuparVagaModalContent from "../../components/Modal/OcuparVagaModalContent";

const Vagas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusVaga>("todos");
  const [filtroTipo, setFiltroTipo] = useState<TipoVaga>("todos");
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [setores, setSetores] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [park, setPark] = useState<string | null>();
  const navigate = useNavigate();

  const { vagas, loading, error, setVagas, registros, veiculos } = useData();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleViewDetails = (id: string) => {
    navigate(`/vagas/${id}`);
  };

  const handleQuickStatusChange = async (vaga: Vaga) => {
    const { ocupada } = vaga;
    if (!ocupada) {
      setShowModal(true);
      setPark(vaga.id);
    } else {
      await handleRetirar(vaga);
    }
  };

  const handleRetirar = async (vaga: Vaga) => {
    const registroAtivo = registros.find(
      (registro) => !registro["data_saida"] && registro.vagaId === vaga.id
    );
    setVagas((prev) => {
      return prev.map((v) => {
        if (v.id == vaga.id) {
          v.ocupada = false;
        }
        return v;
      });
    });
    await api.patch("/estacionamentos/saida/" + registroAtivo?.id, {
      valorPago: 0,
    });
  };

  const findVeiculos = () => {
    const registrosAtivos = registros.filter((regi) => !regi["data_saida"]);
    return vagas.map((vaga) => {
      registrosAtivos.forEach((regi) => {
        if (vaga.id == regi.vagaId) {
          veiculos.forEach((veic) => {
            if (veic.id == regi.veiculoId) {
              vaga["veiculo"] = veic;
            }
          });
        }
      });
      vaga.setor = ''
      return vaga;
    });
  };

  const updatedVagas = useMemo(() => {
    return findVeiculos();
  }, [vagas, loading]);

  const vagasMemo = useMemo(() => {
    setSetores([]);
    return updatedVagas && updatedVagas.filter((vaga) => {
      // Filtro por termo de busca (número ou setor)
      const matchesSearch =
        searchTerm === "" ||
        vaga.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vaga.setor.toLowerCase().includes(searchTerm.toLowerCase());
      // Filtro por status
      let matchesStatus;
      if (filtroStatus === StatusVaga.ocupada) {
        matchesStatus = vaga.ocupada;
      } else if (filtroStatus === StatusVaga.livre) {
        matchesStatus = !vaga.ocupada;
      } else {
        matchesStatus = true;
      }
      // Filtro por tipo
      const matchesTipo = filtroTipo === "todos" || vaga.tipo === filtroTipo;

      // Filtro por setor
      const matchesSetor =
        filtroSetor === "todos" || vaga.setor === filtroSetor;

      return matchesSearch && matchesStatus && matchesTipo && matchesSetor;
    });
  }, [loading, filtroSetor, filtroStatus, filtroTipo, searchTerm]);

  const getStatusClass = (status: boolean) => {
    return !status ? styles.statusLivre : styles.statusOcupada;
  };

  const handleEstacionar = async (veiculo: Veiculo) => {
    setVagas((prev) => {
      return prev.map((vaga) => {
        if (vaga.id == park) {
          vaga.ocupada = true;
        }
        return vaga;
      });
    });
    setShowModal(false);
    await api.post("/estacionamentos/entrada", {
      veiculoId: veiculo.id,
      vagaId: park,
    });
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "Comum":
        return "Comum";
      case "Prioritária":
        return "Prioridade";
      case "Docente":
        return "Docente";
      default:
        return tipo;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "Prioritária":
        return "♿";
      case "Docente":
        return "👴";
      default:
        return "🅿️";
    }
  };

  const getVagasStats = () => {
    const total = vagas.length;
    const livres = vagas.filter((v) => !v.ocupada).length;
    const ocupadas = total - livres;

    return { total, livres, ocupadas };
  };

  const stats = getVagasStats();

  return (
    <MainLayout title="Gerenciamento de Vagas">
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total de Vagas</div>
        </div>
        <div className={`${styles.statCard} ${styles.statLivre}`}>
          <div className={styles.statValue}>{stats.livres}</div>
          <div className={styles.statLabel}>Vagas Livres</div>
        </div>
        <div className={`${styles.statCard} ${styles.statOcupada}`}>
          <div className={styles.statValue}>{stats.ocupadas}</div>
          <div className={styles.statLabel}>Vagas Ocupadas</div>
        </div>
      </div>

      <div className={styles.actionsContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar por número ou setor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="todos">Todos os setores</option>
            {setores.map((setor) => (
              <option key={setor} value={setor}>
                {setor}
              </option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as StatusVaga)}
            className={styles.filterSelect}
          >
            <option value={StatusVaga.todos}>Todos os status</option>
            <option value={StatusVaga.livre}>Livre</option>
            <option value={StatusVaga.ocupada}>Ocupada</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as TipoVaga)}
            className={styles.filterSelect}
          >
            <option value={TipoVaga.todos}>Todos os tipos</option>
            <option value={TipoVaga.comum}>Comum</option>
            <option value={TipoVaga.prioridade}>Prioridade</option>
            <option value={TipoVaga.docente}>Docente</option>
          </select>

          <button type="submit" className={styles.searchButton}>
            Filtrar
          </button>
          <button
            className={styles.addButton}
            onClick={() => navigate("/vagas/novo")}
          >
            Adicionar Vaga
          </button>
        </form>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando vagas...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : vagasMemo.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma vaga encontrada.</p>
        </div>
      ) : (
        <div className={styles.vagasGrid}>
          {vagasMemo.map((vaga) => (
            <div
              key={vaga.id}
              className={`${styles.vagaCard} ${getStatusClass(vaga.ocupada)}`}
            >
              <div className={styles.vagaHeader}>
                <div className={styles.vagaNumero}>{vaga.numero}</div>
                <div className={styles.vagaTipoIcon}>
                  {getTipoIcon(vaga.tipo)}
                </div>
              </div>
              <div className={styles.vagaSetor}>{vaga.setor}</div>
              <div className={styles.vagaTipo}>{getTipoLabel(vaga.tipo)}</div>
              <div className={styles.vagaStatus}>
                {!vaga.ocupada ? "Livre" : "Ocupada"}
              </div>
              <div className={styles.veiculoInfo}>
                {vaga.ocupada && vaga.veiculo && (
                  <>
                    <div>
                      <strong>Modelo:</strong> {vaga.veiculo.modelo}
                    </div>
                    <div>
                      <strong>Placa:</strong> {vaga.veiculo.placa}
                    </div>
                    <div>
                      <strong>Proprietário:</strong>{" "}
                      {vaga.veiculo.aluno?.nome ||
                        vaga.veiculo.docente?.nome ||
                        "N/A"}
                    </div>
                  </>
                )}
              </div>
              <div className={styles.vagaActions}>
                <button
                  className={styles.vagaActionButton}
                  onClick={() => handleViewDetails(vaga.id)}
                >
                  Editar
                </button>
                <button
                  className={`${styles.vagaStatusButton} ${
                    vaga.ocupada
                      ? styles.vagaOcuparButton
                      : styles.vagaLiberarButton
                  }`}
                  onClick={() => handleQuickStatusChange(vaga)}
                >
                  {!vaga.ocupada ? "Ocupar" : "Liberar"}
                </button>
              </div>
            </div>
          ))}
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Confirmar estacionamento"
          >
            <OcuparVagaModalContent
              onConfirm={(veiculoId) => handleEstacionar(veiculoId)}
            />
          </Modal>
        </div>
      )}
    </MainLayout>
  );
};

export default Vagas;
