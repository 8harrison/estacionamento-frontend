import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import styles from './Alunos.module.css';
import { useData } from '../../hooks/useData';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filtredAlunos, setFiltredAlunos] = useState<Aluno[]>([])
  const navigate = useNavigate();
  const {alunos, loading, error} = useData()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }

    setFiltredAlunos(
      alunos.filter(
        aluno => 
          aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) 
  };

  const handleViewDetails = (id: number) => {
    navigate(`/alunos/${id}`);
  };

  useEffect(() => {
    setFiltredAlunos(
      alunos.filter(
        aluno => 
          aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        aluno.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ) 
  }, [])


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
      ) : filtredAlunos.length === 0 ? (
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
              {filtredAlunos.map((aluno) => (
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
