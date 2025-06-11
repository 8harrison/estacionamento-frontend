import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';
import styles from './Dashboard.module.css';

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
    totalVagas: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Buscar estatísticas de alunos
        const alunosResponse = await api.get('/alunos');
        const totalAlunos = alunosResponse.data.length;
        
        // Buscar estatísticas de docentes
        const docentesResponse = await api.get('/docentes');
        const totalDocentes = docentesResponse.data.length;
        
        // Buscar estatísticas de veículos
        const veiculosResponse = await api.get('/veiculos');
        const totalVeiculos = veiculosResponse.data.length;
        
        // Buscar estatísticas de vagas
        const vagasResponse = await api.get('/vagas');
        const vagas = vagasResponse.data;
        const totalVagas = vagas.length;
        const vagasOcupadas = vagas.filter((vaga: any) => vaga.status === 'ocupada').length;
        const vagasDisponiveis = totalVagas - vagasOcupadas;
        
        setStats({
          totalAlunos,
          totalDocentes,
          totalVeiculos,
          vagasOcupadas,
          vagasDisponiveis,
          totalVagas
        });
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
        setError('Não foi possível carregar as estatísticas. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <MainLayout title="Dashboard">
      <div className={styles.welcomeMessage}>
        <h2>Bem-vindo, {user?.nome}!</h2>
        <p>Você está logado como <strong>{user?.role}</strong>.</p>
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
