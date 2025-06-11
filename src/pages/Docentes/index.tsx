import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';
import styles from './Docentes.module.css';

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  cor: string;
}

interface Docente {
  id: number;
  nome: string;
  matricula: string;
  departamento: string;
  veiculos: Veiculo[];
}

const Docentes = () => {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocentes();
  }, []);

  const fetchDocentes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/docentes');
      setDocentes(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar docentes:', err);
      setError('Não foi possível carregar a lista de docentes. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchDocentes();
      return;
    }
  };

  const handleViewDetails = (id: number) => {
    navigate(`/docentes/${id}`);
  };

  const filteredDocentes = searchTerm
    ? docentes.filter(
        docente => 
          docente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          docente.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
          docente.departamento.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : docentes;

  return (
    <MainLayout title="Gerenciamento de Docentes">
      <div className={styles.actionsContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar por nome, matrícula ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>Buscar</button>
        </form>
        
        <button 
          className={styles.addButton}
          onClick={() => navigate('/docentes/novo')}
        >
          Adicionar Docente
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando docentes...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : filteredDocentes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum docente encontrado.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>Departamento</th>
                <th>Veículos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocentes.map((docente) => (
                <tr key={docente.id}>
                  <td>{docente.nome}</td>
                  <td>{docente.matricula}</td>
                  <td>{docente.departamento}</td>
                  <td>{docente.veiculos?.length || 0}</td>
                  <td>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleViewDetails(docente.id)}
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

export default Docentes;
