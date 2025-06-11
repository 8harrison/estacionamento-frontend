import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Modal from '../../components/Modal/Modal';
import api from '../../services/api';
import styles from './VagaForm.module.css';

interface FormData {
  numero: string;
  setor: string;
  tipo: 'comum' | 'acessibilidade' | 'idoso';
  status: 'livre' | 'ocupada';
}

const VagaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<FormData>({
    numero: '',
    setor: '',
    tipo: 'comum',
    status: 'livre'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchVagaData();
    }
  }, [id]);

  const fetchVagaData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vagas/${id}`);
      const vaga = response.data;
      
      setFormData({
        numero: vaga.numero || '',
        setor: vaga.setor || '',
        tipo: vaga.tipo || 'comum',
        status: vaga.status || 'livre'
      });
      
      setError('');
    } catch (err) {
      console.error('Erro ao buscar dados da vaga:', err);
      setError('Não foi possível carregar os dados da vaga. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.numero.trim()) {
      setError('O número da vaga é obrigatório.');
      return false;
    }
    
    if (!formData.setor.trim()) {
      setError('O setor é obrigatório.');
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
      
      if (isEditing) {
        await api.put(`/vagas/${id}`, formData);
      } else {
        await api.post('/vagas', formData);
      }
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/vagas');
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao salvar vaga:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Ocorreu um erro ao salvar os dados. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await api.delete(`/vagas/${id}`);
      setShowConfirmModal(false);
      navigate('/vagas');
    } catch (err: any) {
      console.error('Erro ao excluir vaga:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Não foi possível excluir a vaga. Tente novamente mais tarde.');
      }
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <MainLayout title={isEditing ? 'Editar Vaga' : 'Nova Vaga'}>
        <div className={styles.loading}>Carregando dados da vaga...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEditing ? 'Editar Vaga' : 'Nova Vaga'}>
      {submitSuccess ? (
        <div className={styles.successMessage}>
          Vaga {isEditing ? 'atualizada' : 'cadastrada'} com sucesso! Redirecionando...
        </div>
      ) : (
        <>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="numero" className={styles.label}>Número</label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Número da vaga"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="setor" className={styles.label}>Setor</label>
                <input
                  type="text"
                  id="setor"
                  name="setor"
                  value={formData.setor}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Setor da vaga"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="tipo" className={styles.label}>Tipo</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="comum">Comum</option>
                  <option value="acessibilidade">Acessibilidade</option>
                  <option value="idoso">Idoso</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="status" className={styles.label}>Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="livre">Livre</option>
                  <option value="ocupada">Ocupada</option>
                </select>
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate('/vagas')}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(true)}
                    className={styles.deleteButton}
                    disabled={loading}
                  >
                    Excluir
                  </button>
                )}
                
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
          
          <Modal
            isOpen={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            title="Confirmar Exclusão"
            footer={
              <>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className={styles.deleteButton}
                  disabled={loading}
                >
                  {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                </button>
              </>
            }
          >
            <p>Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.</p>
          </Modal>
        </>
      )}
    </MainLayout>
  );
};

export default VagaForm;
