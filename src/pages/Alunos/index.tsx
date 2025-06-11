import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';
import styles from './Alunos.module.css';

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  cor: string;
}

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  turno: string;
  veiculos: Veiculo[];
}

const Alunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/alunos');
      setAlunos(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar alunos:', err);
      setError('Não foi possível carregar a lista de alunos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchAlunos();
      return;
    }

    const filteredAlunos = alunos.filter(
      aluno => 
        aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setAlunos(filteredAlunos);
  };

  const handleViewDetails = (id: number) => {
    navigate(`/alunos/${id}`);
  };

  const filteredAlunos = searchTerm
    ? alunos.filter(
        aluno => 
          aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : alunos;

  return (
    <MainLayout title="Gerenciamento de Alunos">
      <div className={styles.actionsContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Buscar</button>
        </form>
        
        <button 
          className={styles.addButton}
          onClick={() => navigate('/alunos/novo')}
        >
          Adicionar Aluno
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando alunos...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : filteredAlunos.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum aluno encontrado.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>Turno</th>
                <th>Veículos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                  <td>{aluno.matricula}</td>
                  <td>{aluno.turno}</td>
                  <td>{aluno.veiculos?.length || 0}</td>
                  <td>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewDetails(aluno.id)}
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

export default Alunos;
