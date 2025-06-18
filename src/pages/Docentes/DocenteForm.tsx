import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../components/Layout/MainLayout';
import Modal from '../../components/Modal/Modal';
import api from '../../services/api';
import styles from './DocenteForm.module.css';
import { MeuErro } from '../../customError';
import { useData } from '../../hooks/useData';

interface FormData {
  nome: string;
  matricula: string;
  departamento: string;
  email: string;
  telefone: string;
}

const DocenteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'novo';
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    matricula: '',
    departamento: '',
    email: '',
    telefone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const {docentes, setDocentes} = useData()

  useEffect(() => {
    if (isEditing) {
      fetchDocenteData();
    }
  }, [id]);

  const fetchDocenteData = async () => {
      setLoading(true);
      const docente = docentes.find(docente => docente.id == id);
      setFormData({
        nome: docente?.nome || '',
        matricula: docente?.matricula || '',
        departamento: docente?.departamento || '',
        email: docente?.email || '',
        telefone: docente?.telefone || ''
      });
      setError('');
      setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nome.trim()) {
      setError('O nome é obrigatório.');
      return false;
    }
    
    if (!formData.matricula.trim()) {
      setError('A matrícula é obrigatória.');
      return false;
    }
    
    if (!formData.departamento.trim()) {
      setError('O departamento é obrigatório.');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('O email é obrigatório.');
      return false;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido.');
      return false;
    }
    
    return true;
  };

  const updateDocente = async () => {
    setDocentes(prev => {
      return prev.map(docente => {
        if(docente.id == id){
          docente = {...docente, ...formData}
        }
        return docente
      })
    })
    api.put(`/docentes/${id}`, formData);
  }

  const createDocente = async () => {
   const newDocente = await api.post('/docentes', formData);
   setDocentes(prev => [...prev, newDocente.data])
  }

  const deleteDocente = async () => {
    setDocentes(prev => {
      return prev.filter(docente => {
        return docente.id != id
      })
    })
    api.delete(`/docentes/${id}`);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isEditing) {
        updateDocente()
      } else {
        await createDocente();
      }
      
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/docentes');
      }, 1500);
      
    } catch (err: unknown) {
      if(err instanceof MeuErro)
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
      await deleteDocente();
      setShowConfirmModal(false);
      navigate('/docentes');
    } catch (err) {
      console.error('Erro ao excluir docente:', err);
      setError('Não foi possível excluir o docente. Tente novamente mais tarde.');
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <MainLayout title={isEditing ? 'Editar Docente' : 'Novo Docente'}>
        <div className={styles.loading}>Carregando dados do docente...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEditing ? 'Editar Docente' : 'Novo Docente'}>
      {submitSuccess ? (
        <div className={styles.successMessage}>
          Docente {isEditing ? 'atualizado' : 'cadastrado'} com sucesso! Redirecionando...
        </div>
      ) : (
        <>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="nome" className={styles.label}>Nome</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Nome completo"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="matricula" className={styles.label}>Matrícula</label>
                <input
                  type="text"
                  id="matricula"
                  name="matricula"
                  value={formData.matricula}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Número de matrícula"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="departamento" className={styles.label}>Departamento</label>
                <input
                  type="text"
                  id="departamento"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Departamento"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Email de contato"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="telefone" className={styles.label}>Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Telefone de contato"
                  disabled={loading}
                />
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate('/docentes')}
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
            <p>Tem certeza que deseja excluir este docente? Esta ação não pode ser desfeita.</p>
          </Modal>
        </>
      )}
    </MainLayout>
  );
};

export default DocenteForm;
