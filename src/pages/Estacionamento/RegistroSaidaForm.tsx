import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Modal from '../../components/Modal/Modal';
import api from '../../services/api';
import styles from './Estacionamento.module.css';

interface Registro {
  id: number;
  dataEntrada: string;
  dataSaida: string | null;
  veiculo: {
    id: number;
    placa: string;
    modelo: string;
    cor: string;
    proprietario: {
      id: number;
      nome: string;
      tipo: 'aluno' | 'docente';
    };
  };
  vaga: {
    id: number;
    numero: string;
    setor: string;
    tipo: string;
  };
}

const RegistroSaidaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchRegistro();
  }, [id]);

  const fetchRegistro = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/estacionamento/${id}`);
      
      if (response.data.dataSaida) {
        setError('Este registro já possui saída registrada.');
      } else {
        setRegistro(response.data);
      }
    } catch (err: any) {
      console.error('Erro ao buscar registro:', err);
      if (err.response && err.response.status === 404) {
        setError('Registro não encontrado.');
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Não foi possível carregar os dados do registro. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarSaida = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      await api.post(`/estacionamento/${id}/saida`);
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/estacionamento');
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao registrar saída:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro ao registrar a saída. Tente novamente mais tarde.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <MainLayout title="Registrar Saída">
        <div className={styles.loading}>Carregando dados do registro...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Registrar Saída">
      {submitSuccess ? (
        <div className={styles.successMessage}>
          Saída registrada com sucesso! Redirecionando...
        </div>
      ) : (
        <>
          {error ? (
            <div className={styles.error}>
              <p>{error}</p>
              <button 
                className={styles.cancelButton}
                onClick={() => navigate('/estacionamento')}
              >
                Voltar para Registros
              </button>
            </div>
          ) : registro ? (
            <div className={styles.formContainer}>
              <div className={styles.registroInfo}>
                <h2 className={styles.registroTitle}>Informações do Registro</h2>
                
                <div className={styles.registroDetails}>
                  <div className={styles.registroItem}>
                    <span className={styles.registroLabel}>Veículo:</span>
                    <span className={styles.registroValue}>
                      {registro.veiculo.placa} - {registro.veiculo.modelo} ({registro.veiculo.cor})
                    </span>
                  </div>
                  
                  <div className={styles.registroItem}>
                    <span className={styles.registroLabel}>Proprietário:</span>
                    <span className={styles.registroValue}>
                      {registro.veiculo.proprietario.nome} ({registro.veiculo.proprietario.tipo === 'aluno' ? 'Aluno' : 'Docente'})
                    </span>
                  </div>
                  
                  <div className={styles.registroItem}>
                    <span className={styles.registroLabel}>Vaga:</span>
                    <span className={styles.registroValue}>
                      {registro.vaga.numero} - Setor: {registro.vaga.setor} - Tipo: {registro.vaga.tipo}
                    </span>
                  </div>
                  
                  <div className={styles.registroItem}>
                    <span className={styles.registroLabel}>Data de Entrada:</span>
                    <span className={styles.registroValue}>
                      {formatarData(registro.dataEntrada)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={() => navigate('/estacionamento')}
                    className={styles.cancelButton}
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleRegistrarSaida}
                    className={styles.submitButton}
                    disabled={submitting}
                  >
                    {submitting ? 'Registrando...' : 'Registrar Saída'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.error}>
              <p>Não foi possível carregar os dados do registro.</p>
              <button 
                className={styles.cancelButton}
                onClick={() => navigate('/estacionamento')}
              >
                Voltar para Registros
              </button>
            </div>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default RegistroSaidaForm;
