import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useMemo,
} from "react";
import api, { apiUtilizada } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { Registro, Aluno, Docente, Vaga, Veiculo } from "../types";
import { AxiosError } from "axios";
import { io } from "socket.io-client";

const socket = io(apiUtilizada);

interface ErrorPlaca {
  message: string;
  placa: string;
}
interface DataContextType {
  docentes: Docente[];
  setDocentes: Dispatch<SetStateAction<Docente[]>>;
  alunos: Aluno[];
  setAlunos: Dispatch<SetStateAction<Aluno[]>>;
  loading: boolean;
  error: string;
  setError: Dispatch<SetStateAction<string>>;
  veiculos: Veiculo[];
  setVeiculos: Dispatch<SetStateAction<Veiculo[]>>;
  vagas: Vaga[];
  setVagas: Dispatch<SetStateAction<Vaga[]>>;
  registros: Registro[];
  setRegistros: Dispatch<SetStateAction<Registro[]>>;
  placaListenner: Veiculo | null;
  setPlacaListenner: Dispatch<SetStateAction<Veiculo | null>>;
  alunosCallback: () => void;
  docentesCallback: () => void;
  placaNEncontrada: ErrorPlaca | undefined;
  setPlacaNEncontrada: Dispatch<SetStateAction<ErrorPlaca | undefined>>;
  fetchVagas: () => Promise<void>;
  fecthVeiculos: () => Promise<void>;
  fetchRegistros: () => Promise<Registro>;
  fetchAlunos: () => Promise<void>;
  fetchDocentes: () => Promise<void>;
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
  const [placaListenner, setPlacaListenner] = useState<Veiculo | null>(null);
  const [placaNEncontrada, setPlacaNEncontrada] = useState<
    ErrorPlaca | undefined
  >();

  const { isAuthenticated, user, token } = useAuth();

  const fetchAlunos = async () => {
    try {
      const alunosResponse = await api.get("/alunos");
      setAlunos(alunosResponse.data.filter((aluno: Aluno) => aluno.ativo));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDocentes = async () => {
    try {
      const docentesResponse = await api.get("/docentes");
      setDocentes(
        docentesResponse.data.filter((docente: Docente) => docente.ativo)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const alunosCallback = useCallback(async () => {
    await fetchAlunos();
  }, [veiculos]);

  const docentesCallback = useCallback(async () => {
    await fetchDocentes();
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

  const fetchRegistros = async () => {
    try {
      const registroResponse = await api.get("/estacionamentos"); // Busca todos os registros na API
      setRegistros(registroResponse.data);
      return registroResponse.data;
    } catch (e) {
      console.log(e);
    }
  };

  useMemo(async() => {
    await fetchRegistros();
  }, [vagas]);

  // Verificar se o usuário já está autenticado ao carregar a aplicação
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        alunosCallback(); // Carrega alunos quando atualizar veículos
        docentesCallback(); // Carrega docente quando atualizar veículos
        await fecthVeiculos(); // Carrega veículos
        await fetchVagas(); // Carrega vagas
        const registros = await fetchRegistros(); // Carrega os registros de estacionamentos
        handleSockets(registros);
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
      fetchData().then();
    }
    return () => {
      socket.off("resultado-placa");
    };
  }, [token]);

  function handleSockets(registros: Registro[]) {
    socket.on("resultado-placa", (data: Veiculo[] | any) => {
      const registrosAtivos = registros.filter((reg) => !reg["data_saida"]);
      console.log(registrosAtivos.some((reg) => reg.veiculoId == data[0].id));
      if (data.error) {
        setPlacaNEncontrada(data.error);
      } else if (
        registrosAtivos.some((registro) => registro.veiculoId == data[0].id)
      ) {
        console.log(data[0].id);
        setPlacaNEncontrada({
          message: "Veículo já está no estacionamento",
          placa: data[0].placa,
        });
      } else setPlacaListenner(data[0]);
    });
    socket.on("resultado-novo-estacionamento", (data) => {
      setRegistros((prev) => [data, ...prev]);
    });
  }

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
    placaListenner,
    setPlacaListenner,
    placaNEncontrada,
    setPlacaNEncontrada,
    fetchVagas,
    fecthVeiculos,
    fetchRegistros,
    fetchAlunos,
    fetchDocentes,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
