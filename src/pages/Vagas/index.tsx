import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import api from "../../services/api";
import styles from "./Vagas.module.css";
import { useData } from "../../hooks/useData";

enum TipoVaga {
  comum = "Comum",
  prioridade = "Prioritária",
  docente = "Docente",
  todos = "todos",
}

enum StatusVaga {
  todos = "todos",
  livre = "livre",
  ocupada = "ocupada",
}

interface Vaga {
  id: number;
  numero: string;
  setor: string;
  tipo: TipoVaga;
  ocupada: boolean;
}

const Vagas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusVaga>(
    StatusVaga.todos
  );
  const [filteredVagas, setFilteredVagas] = useState<Vaga[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<TipoVaga>(TipoVaga.todos);
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [setores, setSetores] = useState<string[]>([]);
  const navigate = useNavigate();

  const { vagas, loading, error } = useData();

  useEffect(() => {
    fetchVagas();
    handleFilter()
  }, [loading]);

  const fetchVagas = async () => {
    // Extrair setores únicos para o filtro
    const uniqueSetores = Array.from(
      new Set(vagas.map((vaga: Vaga) => vaga.setor))
    );
    setSetores(uniqueSetores as string[]);
    setFilteredVagas(vagas);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleViewDetails = (id: number) => {
    navigate(`/vagas/${id}`);
  };

  const handleQuickStatusChange = async (vaga: Vaga) => {
    const newStatus = vaga.ocupada ? true : false;
    await api.put(`/vagas/${vaga.id}`, { ocupada: newStatus });

    // Atualizar localmente para feedback imediato
    setFilteredVagas(
      vagas.map((v) => (v.id === vaga.id ? { ...v, ocupada: newStatus } : v))
    );
  };

  const handleFilter = () => {
    const filteredVagas = vagas.filter((vaga) => {
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
        return vaga;
      }
      // Filtro por tipo
      const matchesTipo = filtroTipo === "todos" || vaga.tipo === filtroTipo;

      // Filtro por setor
      const matchesSetor =
        filtroSetor === "todos" || vaga.setor === filtroSetor;

      return matchesSearch && matchesStatus && matchesTipo && matchesSetor;
    });

    setFilteredVagas(filteredVagas)
  };  

  const getStatusClass = (status: boolean) => {
    return !status ? styles.statusLivre : styles.statusOcupada;
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
      ) : filteredVagas.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhuma vaga encontrada.</p>
        </div>
      ) : (
        <div className={styles.vagasGrid}>
          {filteredVagas.map((vaga) => (
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
        </div>
      )}
    </MainLayout>
  );
};

export default Vagas;
