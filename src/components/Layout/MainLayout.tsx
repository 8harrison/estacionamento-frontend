import { ReactNode, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Estacionamento</span>
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.nome || 'Usuário'}</div>
          <div className={styles.userRole}>{user?.role === 'administrador' ? 'Administrador' : 'Porteiro'}</div>
        </div>
        
        <nav className={styles.nav}>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Dashboard
          </NavLink>
          
          <NavLink 
            to="/alunos" 
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Alunos
          </NavLink>
          
          <NavLink 
            to="/docentes" 
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Docentes
          </NavLink>
          
          <NavLink 
            to="/veiculos" 
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Veículos
          </NavLink>
          
          <NavLink 
            to="/vagas" 
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Vagas
          </NavLink>
          
          <NavLink 
            to="/estacionamento" 
            className={({ isActive }) => 
              isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
            }
          >
            Registros
          </NavLink>
          
          {user?.role === 'administrador' && (
            <NavLink 
              to="/usuarios" 
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              Usuários
            </NavLink>
          )}
          
          <a href="#" onClick={handleLogout} className={styles.navItem}>
            Sair
          </a>
        </nav>
      </aside>
      
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
        </header>
        
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
