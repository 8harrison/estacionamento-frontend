import { useState, useEffect} from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/Layout/MainLayout";
import styles from "./RegistroInformacao.module.css";
import { useData } from "../../hooks/useData";
import type { Registro } from "../../types";

const RegistroInformacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingDados, setLoadingDados] = useState(true);
  const { registros } = useData();
  const [info, setInfo] = useState<Partial<Registro>>({
    id: "0",
    veiculoId: "0",
    vagaId: "0",
    data_entrada: "",
    data_saida: "",
    veiculo: undefined,
    vaga: undefined,
  });

  useEffect(() => {
    fetchDados();
  }, [loadingDados]);

  const fetchDados = async () => {
      setLoadingDados(true);
      const registro = registros.find((registro) => registro.id == id);
      setInfo({ ...registro });
      if(!registro)
        navigate('/estacionamento')

      setLoadingDados(false);
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleString("pt-BR");
  };

  if (loadingDados) {
    return (
      <MainLayout title="Registrar Entrada">
        <div className={styles.loading}>Carregando dados...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Informações do Registro">
      <div className={styles.formContainer}>
        <h2>Registro #{info.id}</h2>

        <div className={styles.infoGrid}>
          <div>
            <strong>Placa:</strong> {info.veiculo?.placa}
          </div>
          <div>
            <strong>Veículo:</strong> {info.veiculo?.modelo} (
            {info.veiculo?.cor})
          </div>
          <div>
            <strong>Proprietário:</strong>{" "}
            {info.veiculo?.aluno?.nome || info.veiculo?.docente?.nome}
            {"    "}
            ({info.veiculo?.aluno ? 'Aluno' : 'Docente'})
          </div>
          <div>
            <strong>Vaga:</strong> {info.vaga?.numero} - Tipo {" "} {info.vaga?.tipo}
          </div>
          <div>
            <strong>Data de entrada:</strong>{" "}
            {formatarData(info.data_entrada || "")}
          </div>
          <div>
            <strong>Data de saída:</strong>{" "}
            {info.data_saida ? formatarData(info.data_saida) : "-"}
          </div>
        </div>
        <div className={styles.actions}>
          <button
            onClick={() => navigate("/estacionamento")}
            className={styles.backButton}
          >
            Voltar
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegistroInformacao;
