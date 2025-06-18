import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  useCallback,
} from "react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { Registro, Aluno, Docente, Vaga, Veiculo } from "../types";
import { AxiosError } from "axios";
import { io } from "socket.io-client";

const socket = io('http://localhost:3000')
interface DataContextType {
  docentes: Docente[];
  setDocentes: Dispatch<SetStateAction<Docente[]>>;
  alunos: Aluno[];
  setAlunos: Dispatch<SetStateAction<Aluno[]>>;
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>
  veiculos: Veiculo[];
  setVeiculos: Dispatch<SetStateAction<Veiculo[]>>;
  vagas: Vaga[];
  setVagas: Dispatch<SetStateAction<Vaga[]>>;
  registros: Registro[];
  setRegistros: Dispatch<SetStateAction<Registro[]>>;
  alunosCallback: () => void;
  docentesCallback: () => void;
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
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [registros, setRegistros] = useState<Registro[]>([]);

  const { isAuthenticated, user, token } = useAuth();

  const alunosCallback = useCallback(async () => {
    try {
      const alunosResponse = await api.get("/alunos");
      setAlunos(alunosResponse.data.filter((aluno: Aluno) => aluno.ativo));
    } catch (e) {
      console.log(e);
    }
  }, [veiculos]);

  const docentesCallback = useCallback(async () => {
    try {
      const docentesResponse = await api.get("/docentes");
      setDocentes(
        docentesResponse.data.filter((docente: Docente) => docente.ativo)
      );
    } catch (e) {
      console.log(e);
    }
  }, [veiculos]);

  const fecthVeiculos = async () => {
    try {
      const veiculosResponse = await api.get("/veiculos");
      setVeiculos(veiculosResponse.data.filter((veiculo: Veiculo) => veiculo));
      return veiculosResponse.data;
    } catch (e) {
      console.log(e);
    }
  };

  const fetchVagas = async () => {
    try {
      const vagasResponse = await api.get("/vagas");
      setVagas(vagasResponse.data);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchRegistros = async (veiculos: Veiculo[]) => {
    try {
      const registroResponse = await api.get("/estacionamentos"); // Busca todos os registros na API
      setRegistros(
        registroResponse.data.map((registro: Registro) => {
          const veiculo = veiculos.find(
            (veiculo: Veiculo) => veiculo.id == registro.veiculoId // Procura em veículos o veiculoId correspondente em registros
          );
          if (veiculo) registro.veiculo = veiculo; //Caso encontre o veiculo, insere o valor do veiculo encontrado no registro correspondente
          return registro;
        })
      );
    } catch (e) {
      console.log(e);
    }
  };

  // Verificar se o usuário já está autenticado ao carregar a aplicação
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        alunosCallback(); // Carrega alunos quando atualizar veículos
        docentesCallback(); // Carrega docente quando atualizar veículos
        const veiculosResponse = await fecthVeiculos(); // Carrega veículos
        await fetchVagas(); // Carrega vagas
        await fetchRegistros(veiculosResponse); // Carrega os registros de estacionamentos
      } catch (e: unknown) {
        if (e instanceof AxiosError)
          if (e?.response?.status == 403) {
            setError("Seu Token expirou, realize um novo login");
          } else {
            setError(
              "Não foi possível carregar as estatísticas. Tente novamente mais tarde."
            );
          }
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && token) {
      fetchData();
      socket.on('resultado-placa', (data) => {
      console.log(data)
    })
    }
    return () => socket.off('resultado-placa')
  }, [token]);

  
  // Valores a serem disponibilizados pelo contexto
  const value = {
    loading,
    alunos,
    setAlunos,
    docentes,
    setDocentes,
    veiculos,
    setVeiculos,
    error,
    setError,
    vagas,
    setVagas,
    registros,
    setRegistros,
    alunosCallback,
    docentesCallback,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
