import { useNavigate } from 'react-router-dom';
import styles from './AccessDenied.module.css';

const AccessDenied = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>&#x26D4;</span>
        </div>
        
        <h1 className={styles.title}>Acesso Negado</h1>
        
        <p className={styles.message}>
          Você não tem permissão para acessar esta página.
        </p>
        
        <p className={styles.subMessage}>
          Verifique se você está usando a conta correta ou entre em contato com o administrador do sistema.
        </p>
        
        <div className={styles.actions}>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={handleGoToDashboard}
          >
            Ir para o Dashboard
          </button>
          
          <button 
            className={`${styles.button} ${styles.secondaryButton}`}
            onClick={handleGoBack}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
