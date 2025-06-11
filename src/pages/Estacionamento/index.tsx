import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';
import styles from './Estacionamento.module.css';

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  cor: string;
  proprietario: {
    id: number;
    nome: string;
    tipo: 'aluno' | 'docente';
  };
}

interface Vaga {
  id: number;
  numero: string;
  setor: string;
  tipo: string;
  status: 'livre' | 'ocupada';
}

interface Registro {
  id: number;
  dataEntrada: string;
  dataSaida: string | null;
  veiculo: Veiculo;
  vaga: Vaga;
}

const Estacionamento = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'ativos' | 'finalizados'>('todos');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRegistros();
  }, []);

  const fetchRegistros = async () => {
    try {
      setLoading(true);
      const response = await api.get('/estacionamento');
      setRegistros(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar registros:', err);
      setError('Não foi possível carregar os registros de estacionamento. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleRegistrarEntrada = () => {
    navigate('/estacionamento/entrada');
  };

  const handleRegistrarSaida = (id: number) => {
    navigate(`/estacionamento/${id}/saida`);
  };

  const handleViewDetails = (id: number) => {
    navigate(`/estacionamento/${id}`);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  const filteredRegistros = registros.filter(registro => {
    // Filtro por termo de busca (placa ou proprietário)
    const matchesSearch = searchTerm === '' || 
      registro.veiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registro.veiculo.proprietario.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por status
    const matchesStatus = filtroStatus === 'todos' || 
      (filtroStatus === 'ativos' && registro.dataSaida === null) ||
      (filtroStatus === 'finalizados' && registro.dataSaida !== null);
    
    return matchesSearch && matchesStatus;
  });

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
            onChange={(e) => setFiltroStatus(e.target.value as 'todos' | 'ativos' | 'finalizados')}
            className={styles.filterSelect}
          >
            <option value="todos">Todos os registros</option>
            <option value="ativos">Veículos estacionados</option>
            <option value="finalizados">Registros finalizados</option>
          </select>
          
          <button type="submit" className={styles.searchButton}>Filtrar</button>
        </form>
        
        <button 
          className={styles.addButton}
          onClick={handleRegistrarEntrada}
        >
          Registrar Entrada
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando registros...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : filteredRegistros.length === 0 ? (
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
              {filteredRegistros.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.veiculo.placa}</td>
                  <td>{registro.veiculo.modelo} ({registro.veiculo.cor})</td>
                  <td>{registro.veiculo.proprietario.nome}</td>
                  <td>{registro.vaga.numero} ({registro.vaga.setor})</td>
                  <td>{formatarData(registro.dataEntrada)}</td>
                  <td>{registro.dataSaida ? formatarData(registro.dataSaida) : '-'}</td>
                  <td>
                    <div className={styles.actionButtonsContainer}>
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleViewDetails(registro.id)}
                      >
                        Detalhes
                      </button>
                      
                      {!registro.dataSaida && (
                        <button 
                          className={styles.actionButtonDanger}
                          onClick={() => handleRegistrarSaida(registro.id)}
                        >
                          Registrar Saída
                        </button>
                      )}
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
