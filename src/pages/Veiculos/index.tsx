import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';
import styles from './Veiculos.module.css';

interface Proprietario {
  id: number;
  nome: string;
  tipo: 'aluno' | 'docente';
  matricula: string;
}

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  cor: string;
  proprietario?: Proprietario;
}

const Veiculos = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/veiculos');
      setVeiculos(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
      setError('Não foi possível carregar a lista de veículos. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchVeiculos();
      return;
    }

    try {
      setLoading(true);
      // Usando o endpoint de busca específico para veículos
      const response = await api.get(`/veiculos/buscar?termo=${searchTerm}`);
      setVeiculos(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
      setError('Não foi possível realizar a busca. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/veiculos/${id}`);
  };

  return (
    <MainLayout title="Gerenciamento de Veículos">
      <div className={styles.actionsContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar por placa ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Buscar</button>
        </form>
        
        <button 
          className={styles.addButton}
          onClick={() => navigate('/veiculos/novo')}
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
              {veiculos.map((veiculo) => (
                <tr key={veiculo.id}>
                  <td>{veiculo.placa}</td>
                  <td>{veiculo.modelo}</td>
                  <td>{veiculo.cor}</td>
                  <td>{veiculo.aluno?.nome || veiculo.docente?.nome || 'N/A'}</td>
                  <td>{veiculo.proprietario?.tipo === 'aluno' ? 'Aluno' : 'Docente'}</td>
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
