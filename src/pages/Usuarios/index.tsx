import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import api from '../../services/api';
import styles from './Usuarios.module.css';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: 'administrador' | 'porteiro';
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroRole, setFiltroRole] = useState<'todos' | 'administrador' | 'porteiro'>('todos');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setError('Não foi possível carregar a lista de usuários. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleViewDetails = (id: number) => {
    navigate(`/usuarios/${id}`);
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    // Filtro por termo de busca (nome ou email)
    const matchesSearch = searchTerm === '' || 
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por role
    const matchesRole = filtroRole === 'todos' || usuario.role === filtroRole;
    
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    return role === 'administrador' ? 'Administrador' : 'Porteiro';
  };

  return (
    <MainLayout title="Gerenciamento de Usuários">
      <div className={styles.actionsContainer}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          
          <select 
            value={filtroRole} 
            onChange={(e) => setFiltroRole(e.target.value as 'todos' | 'administrador' | 'porteiro')}
            className={styles.filterSelect}
          >
            <option value="todos">Todos os perfis</option>
            <option value="administrador">Administradores</option>
            <option value="porteiro">Porteiros</option>
          </select>
          
          <button type="submit" className={styles.searchButton}>Filtrar</button>
        </form>
        
        <button 
          className={styles.addButton}
          onClick={() => navigate('/usuarios/novo')}
        >
          Adicionar Usuário
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Carregando usuários...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : filteredUsuarios.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                  <td>{getRoleLabel(usuario.role)}</td>
                  <td>
                    <div className={styles.actionButtonsContainer}>
                      <button 
                        className={styles.actionButton}
                        onClick={() => handleViewDetails(usuario.id)}
                      >
                        Detalhes
                      </button>
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

export default Usuarios;
