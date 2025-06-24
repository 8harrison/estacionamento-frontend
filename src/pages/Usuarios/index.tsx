import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./Usuarios.module.css";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../contexts/AuthContext";
import InfoList from "../../components/InfoCard/InfoList";

type RoleType = "todos" | "administrador" | "porteiro";

const emojiPermissao = {
  administrador: "👑", // coroa → autoridade
  porteiro: "🛡️",      // escudo → segurança
} as const;


const Usuarios = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRole, setFiltroRole] = useState<RoleType>("todos");
  const navigate = useNavigate();
  const { usuarios, loading, error } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleViewDetails = (id: string) => {
    navigate(`/usuarios/detalhes`, {
      state: { id },
    });
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    // Filtro por termo de busca (nome ou email)
    const matchesSearch =
      searchTerm === "" ||
      usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por role
    const matchesRole = filtroRole === "todos" || usuario.role === filtroRole;

    return matchesSearch && matchesRole;
  });

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
            onChange={(e) =>
              setFiltroRole(
                e.target.value as "todos" | "administrador" | "porteiro"
              )
            }
            className={styles.filterSelect}
          >
            <option value="todos">Todos os perfis</option>
            <option value="administrador">Administradores</option>
            <option value="porteiro">Porteiros</option>
          </select>

          <button type="submit" className={styles.searchButton}>
            Filtrar
          </button>
        </form>

        <button
          className={styles.addButton}
          onClick={() =>
            navigate("/usuarios/detalhes", { state: { id: "novo" } })
          }
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
        <InfoList<User>
          data={filteredUsuarios}
          infoCard={{
            title: "nome",
            subtitle: (a) => emojiPermissao[a.role as 'administrador' | 'porteiro'],
            info: [
              { label: "EMAIL", value: "email" },
              { label: "PERMISSÃO", value: "role" },
            ],
            actions: (docente) => (
              <button
                className={styles.actionButton}
                onClick={() => handleViewDetails(docente.id)}
              >
                Detalhes
              </button>
            ),
          }}
        />
      )}
    </MainLayout>
  );
};

export default Usuarios;
