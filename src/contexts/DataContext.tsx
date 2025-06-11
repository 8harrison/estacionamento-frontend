import { createContext, useState, useEffect, type ReactNode } from "react";
import api from "../services/api";

enum TipoVaga {
  comum = 'Comum',
  prioridade = 'Prioritária',
  docente = 'Docente',
  todos = 'todos'
}

interface Veiculo {
  id: number;
  placa: string;
  modelo: string;
  cor: string;
}

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  turno: string;
  veiculos: Veiculo[];
}

interface Docente {
  id: number;
  nome: string;
  matricula: string;
  departamento: string;
  veiculos: Veiculo[];
}

interface DataContextType {
  docentes: Docente[];
  alunos: Aluno[];
  loading: boolean;
  error: string;
  veiculos: Veiculo[];
  vagas: Vaga[];
}

export interface Vaga {
  id: number;
  numero: string;
  setor: string;
  tipo: TipoVaga;
  ocupada: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Criando o contexto de autenticação
export const DataContext = createContext<DataContextType>(
  {} as DataContextType
);

// Provider do contexto de autenticação
export const DataProvider = ({ children }: AuthProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [vagas, setVagas] = useState<Vaga[]>([])

  // Verificar se o usuário já está autenticado ao carregar a aplicação
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const alunosResponse = await api.get("/alunos");
        setAlunos(alunosResponse.data);

        const docentesResponse = await api.get("/docentes");
        setDocentes(docentesResponse.data);

        const veiculosResponse = await api.get("/veiculos");
        setVeiculos(veiculosResponse.data);

        const vagasResponse = await api.get('/vagas');
        setVagas(vagasResponse.data)

      } catch (e) {
        console.error(e)
        setError(
          "Não foi possível carregar as estatísticas. Tente novamente mais tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData()
  }, []);

  // Valores a serem disponibilizados pelo contexto
  const value = {
    loading,
    alunos,
    docentes,
    veiculos,
    error,
    vagas
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};


