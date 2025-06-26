import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./Dashboard.module.css";
import { useData } from "../../hooks/useData";
import type { Vaga } from "../../types";
interface DashboardStats {
  totalAlunos: number;
  totalDocentes: number;
  totalVeiculos: number;
  vagasOcupadas: number;
  vagasDisponiveis: number;
  totalVagas: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    totalDocentes: 0,
    totalVeiculos: 0,
    vagasOcupadas: 0,
    vagasDisponiveis: 0,
    totalVagas: 0,
  });
  const { loading, error, alunos, docentes, veiculos, vagas } = useData();

  useEffect(() => {
    fetchStats();
  }, [loading]);

  const fetchStats = async () => {
    try {
      const totalAlunos = alunos.length;

      const totalDocentes = docentes.length;

      const totalVeiculos = veiculos.length;

      const totalVagas = vagas.length;
      const vagasOcupadas = vagas.filter((vaga: Vaga) => vaga.ocupada).length;
      const vagasDisponiveis = totalVagas - vagasOcupadas;

      setStats({
        totalAlunos,
        totalDocentes,
        totalVeiculos,
        vagasOcupadas,
        vagasDisponiveis,
        totalVagas,
      });
    } catch (err) {
      console.error("Erro ao buscar estatísticas:", err);
    }
  };

  return (
    <MainLayout title="Dashboard">
      <div className={styles.welcomeMessage}>
        <h2>Bem-vindo, {user?.nome}!</h2>
        <p>
          Você está logado como <strong>{user?.role}</strong>.
        </p>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando estatísticas...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Alunos</h3>
            <div className={styles.statValue}>{stats.totalAlunos}</div>
          </div>

          <div className={styles.statCard}>
            <h3>Docentes</h3>
            <div className={styles.statValue}>{stats.totalDocentes}</div>
          </div>

          <div className={styles.statCard}>
            <h3>Veículos</h3>
            <div className={styles.statValue}>{stats.totalVeiculos}</div>
          </div>

          <div className={styles.statCard}>
            <h3>Vagas Ocupadas</h3>
            <div className={styles.statValue}>{stats.vagasOcupadas}</div>
          </div>

          <div className={styles.statCard}>
            <h3>Vagas Disponíveis</h3>
            <div className={styles.statValue}>{stats.vagasDisponiveis}</div>
          </div>

          <div className={styles.statCard}>
            <h3>Total de Vagas</h3>
            <div className={styles.statValue}>{stats.totalVagas}</div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Dashboard;
