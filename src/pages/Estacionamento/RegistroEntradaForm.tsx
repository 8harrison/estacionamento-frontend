import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Modal from '../../components/Modal/Modal';
import api from '../../services/api';
import styles from './Estacionamento.module.css';

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  cor: string;
}

interface Vaga {
  id: number;
  numero: string;
  setor: string;
  tipo: string;
  status: string;
}

interface FormData {
  veiculoId: number;
  vagaId: number;
}

const RegistroEntradaForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<FormData>({
    veiculoId: 0,
    vagaId: 0
  });
  
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [filtroPlaca, setFiltroPlaca] = useState('');

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      setLoadingDados(true);
      
      const [veiculosResponse, vagasResponse] = await Promise.all([
        api.get('/veiculos'),
        api.get('/vagas?status=livre')
      ]);
      
      setVeiculos(veiculosResponse.data);
      setVagas(vagasResponse.data);
      setError('');
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Não foi possível carregar os dados necessários. Tente novamente mais tarde.');
    } finally {
      setLoadingDados(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleFiltroPlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroPlaca(e.target.value);
  };

  const validateForm = () => {
    if (formData.veiculoId === 0) {
      setError('É necessário selecionar um veículo.');
      return false;
    }
    
    if (formData.vagaId === 0) {
      setError('É necessário selecionar uma vaga.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await api.post('/estacionamento/entrada', formData);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/estacionamento');
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao registrar entrada:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro ao registrar a entrada. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const veiculosFiltrados = veiculos.filter(veiculo => 
    filtroPlaca === '' || veiculo.placa.toLowerCase().includes(filtroPlaca.toLowerCase())
  );

  if (loadingDados) {
    return (
      <MainLayout title="Registrar Entrada">
        <div className={styles.loading}>Carregando dados...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Registrar Entrada">
      {submitSuccess ? (
        <div className={styles.successMessage}>
          Entrada registrada com sucesso! Redirecionando...
        </div>
      ) : (
        <>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="filtroPlaca" className={styles.label}>Filtrar veículos por placa</label>
                <input
                  type="text"
                  id="filtroPlaca"
                  value={filtroPlaca}
                  onChange={handleFiltroPlacaChange}
                  className={styles.input}
                  placeholder="Digite a placa para filtrar"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="veiculoId" className={styles.label}>Veículo</label>
                <select
                  id="veiculoId"
                  name="veiculoId"
                  value={formData.veiculoId}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value={0}>Selecione um veículo</option>
                  {veiculosFiltrados.map(veiculo => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.modelo} ({veiculo.cor})
                    </option>
                  ))}
                </select>
                {veiculosFiltrados.length === 0 && (
                  <p className={styles.helperText}>
                    Nenhum veículo encontrado com esta placa.
                  </p>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="vagaId" className={styles.label}>Vaga</label>
                <select
                  id="vagaId"
                  name="vagaId"
                  value={formData.vagaId}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value={0}>Selecione uma vaga</option>
                  {vagas.map(vaga => (
                    <option key={vaga.id} value={vaga.id}>
                      {vaga.numero} - Setor: {vaga.setor} - Tipo: {vaga.tipo}
                    </option>
                  ))}
                </select>
                {vagas.length === 0 && (
                  <p className={styles.helperText}>
                    Não há vagas livres disponíveis no momento.
                  </p>
                )}
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate('/estacionamento')}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || vagas.length === 0}
                >
                  {loading ? 'Registrando...' : 'Registrar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </MainLayout>
  );
};

export default RegistroEntradaForm;
