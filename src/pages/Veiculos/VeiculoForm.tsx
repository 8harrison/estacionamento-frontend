import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Modal from '../../components/Modal/Modal';
import api from '../../services/api';
import styles from './VeiculoForm.module.css';

interface Proprietario {
  id: number;
  nome: string;
  tipo: 'aluno' | 'docente';
}

interface FormData {
  placa: string;
  modelo: string;
  cor: string;
  proprietarioId: number;
  proprietarioTipo: 'aluno' | 'docente';
}

const VeiculoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<FormData>({
    placa: '',
    modelo: '',
    cor: '',
    proprietarioId: 0,
    proprietarioTipo: 'aluno'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [alunos, setAlunos] = useState<Proprietario[]>([]);
  const [docentes, setDocentes] = useState<Proprietario[]>([]);
  const [loadingProprietarios, setLoadingProprietarios] = useState(false);

  useEffect(() => {
    fetchProprietarios();
    
    if (isEditing) {
      fetchVeiculoData();
    }
  }, [id]);

  const fetchProprietarios = async () => {
    try {
      setLoadingProprietarios(true);
      
      const [alunosResponse, docentesResponse] = await Promise.all([
        api.get('/alunos'),
        api.get('/docentes')
      ]);
      
      setAlunos(alunosResponse.data);
      setDocentes(docentesResponse.data);
    } catch (err) {
      console.error('Erro ao buscar proprietários:', err);
      setError('Não foi possível carregar a lista de proprietários. Tente novamente mais tarde.');
    } finally {
      setLoadingProprietarios(false);
    }
  };

  const fetchVeiculoData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/veiculos/${id}`);
      const veiculo = response.data;
      console.log(veiculo)
      setFormData({
        placa: veiculo.placa || '',
        modelo: veiculo.modelo || '',
        cor: veiculo.cor || '',
        proprietarioId: veiculo.proprietario?.id || 0,
        proprietarioTipo: veiculo.proprietario?.tipo || 'aluno'
      });
      
      setError('');
    } catch (err) {
      console.error('Erro ao buscar dados do veículo:', err);
      setError('Não foi possível carregar os dados do veículo. Tente novamente mais tarde.');
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

  const handleProprietarioTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value as 'aluno' | 'docente';
    setFormData(prev => ({
      ...prev,
      proprietarioTipo: tipo,
      proprietarioId: 0 // Resetar o ID quando mudar o tipo
    }));
  };

  const validateForm = () => {
    if (!formData.placa.trim()) {
      setError('A placa é obrigatória.');
      return false;
    }
    
    if (!formData.modelo.trim()) {
      setError('O modelo é obrigatório.');
      return false;
    }
    
    if (!formData.cor.trim()) {
      setError('A cor é obrigatória.');
      return false;
    }
    
    if (formData.proprietarioId === 0) {
      setError('É necessário selecionar um proprietário.');
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
      
      const payload = {
        placa: formData.placa,
        modelo: formData.modelo,
        cor: formData.cor,
        proprietarioId: formData.proprietarioId,
        proprietarioTipo: formData.proprietarioTipo
      };
      
      if (isEditing) {
        await api.put(`/veiculos/${id}`, payload);
      } else {
        await api.post('/veiculos', payload);
      }
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/veiculos');
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao salvar veículo:', err);
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
      await api.delete(`/veiculos/${id}`);
      setShowConfirmModal(false);
      navigate('/veiculos');
    } catch (err) {
      console.error('Erro ao excluir veículo:', err);
      setError('Não foi possível excluir o veículo. Tente novamente mais tarde.');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  if ((loading && isEditing) || loadingProprietarios) {
    return (
      <MainLayout title={isEditing ? 'Editar Veículo' : 'Novo Veículo'}>
        <div className={styles.loading}>Carregando dados...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEditing ? 'Editar Veículo' : 'Novo Veículo'}>
      {submitSuccess ? (
        <div className={styles.successMessage}>
          Veículo {isEditing ? 'atualizado' : 'cadastrado'} com sucesso! Redirecionando...
        </div>
      ) : (
        <>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="placa" className={styles.label}>Placa</label>
                <input
                  type="text"
                  id="placa"
                  name="placa"
                  value={formData.placa}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Placa do veículo"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="modelo" className={styles.label}>Modelo</label>
                <input
                  type="text"
                  id="modelo"
                  name="modelo"
                  value={formData.modelo}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Modelo do veículo"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="cor" className={styles.label}>Cor</label>
                <input
                  type="text"
                  id="cor"
                  name="cor"
                  value={formData.cor}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Cor do veículo"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="proprietarioTipo" className={styles.label}>Tipo de Proprietário</label>
                <select
                  id="proprietarioTipo"
                  name="proprietarioTipo"
                  value={formData.proprietarioTipo}
                  onChange={handleProprietarioTipoChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value="aluno">Aluno</option>
                  <option value="docente">Docente</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="proprietarioId" className={styles.label}>Proprietário</label>
                <select
                  id="proprietarioId"
                  name="proprietarioId"
                  value={formData.proprietarioId}
                  onChange={handleChange}
                  className={styles.select}
                  disabled={loading}
                >
                  <option value={0}>Selecione um proprietário</option>
                  
                  {formData.proprietarioTipo === 'aluno' ? (
                    alunos.map(aluno => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.nome} - Matrícula: {aluno.matricula}
                      </option>
                    ))
                  ) : (
                    docentes.map(docente => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nome} - Departamento: {docente.departamento}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate('/veiculos')}
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
            <p>Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.</p>
          </Modal>
        </>
      )}
    </MainLayout>
  );
};

export default VeiculoForm;
