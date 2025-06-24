import { type ReactNode, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./MainLayout.module.css";
import { FiMenu, FiX } from "react-icons/fi";
import ModalComPlaca from "../Modal/ModalComPlaca";
import { useData } from "../../hooks/useData";
import ModalPlacaNaoEncontrada from "../Modal/ModalPlacaNaoEncontrada";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const { placaListenner, placaNEncontrada } = useData();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModalPlaca, setShowModalPlaca] = useState(false);
  const [showModalPlacaNaoEncontrada, setShowModalPlacaNaoEncontrada] = useState(false)

  useEffect(() => {
    if (placaListenner) {
      setShowModalPlaca(true);
    }
    if(placaNEncontrada){
      setShowModalPlacaNaoEncontrada(true)
    }
  }, [placaListenner, placaNEncontrada]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={styles.container}>
      <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}>
        <div className={styles.logo}>
          <span className={styles.logoText}>Estacionamento</span>
        </div>

        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.nome || "Usuário"}</div>
          <div className={styles.userRole}>
            {user?.role === "administrador" ? "Administrador" : user?.role === 'master' ? 'Master' : "Porteiro"}
          </div>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/alunos"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
          >
            Alunos
          </NavLink>

          <NavLink
            to="/docentes"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
          >
            Docentes
          </NavLink>

          <NavLink
            to="/veiculos"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
          >
            Veículos
          </NavLink>

          <NavLink
            to="/vagas"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
          >
            Vagas
          </NavLink>

          <NavLink
            to="/estacionamento"
            className={({ isActive }) =>
              isActive
                ? `${styles.navItem} ${styles.navItemActive}`
                : styles.navItem
            }
          >
            Registros
          </NavLink>

          {(user?.role === "administrador" || user?.role === 'master') && (
            <NavLink
              to="/usuarios"
              className={({ isActive }) =>
                isActive
                  ? `${styles.navItem} ${styles.navItemActive}`
                  : styles.navItem
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

        <div className={styles.content}>{children}</div>
      </main>
      <ModalComPlaca
        isOpen={showModalPlaca}
        onClose={() => setShowModalPlaca(false)}
      />
      <ModalPlacaNaoEncontrada 
        isOpen={showModalPlacaNaoEncontrada}
        onClose={() => setShowModalPlacaNaoEncontrada(false)}
        placa={placaNEncontrada && placaNEncontrada!.placa}
        mensagemErro={placaNEncontrada?.message}
      />
    </div>
  );
};

export default MainLayout;
