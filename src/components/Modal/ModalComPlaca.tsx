import { useState } from "react";
import Modal from "./Modal";
import type { Vaga } from "../../types";
import { useData } from "../../hooks/useData";
import styles from "./ModalComPlaca.module.css";
import api from "../../services/api";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ModalComPlaca(props: ModalProps) {
  const { isOpen, onClose } = props;
  const [busca, setBusca] = useState("");
  const [vagaSelecionada, setVagaSelecionada] = useState<Vaga | null>(null);
  const { vagas, placaListenner, setPlacaListenner, setVagas } = useData();
  const vagasFiltradas = vagas.filter(
    (vaga) =>
      !vaga.ocupada && vaga.numero.toLowerCase().includes(busca.toLowerCase())
  );

  const onConfirmar = async (vagaSelecionada: Vaga) => {
    // Faz o post para inserir o registro
    try{
      await api.post("/estacionamentos/entrada", {
        veiculoId: placaListenner?.id,
        vagaId: vagaSelecionada.id,
      });
      setVagas((prev) => {
        return prev.map((vaga) => {
          if (vaga.id == vagaSelecionada.id) {
            vaga.ocupada = true;
          }
          return vaga;
        });
      });
    } catch(e){
      console.log(e)
      
    } finally{
      setPlacaListenner(null);
      onClose();
    }
    
  };

  const onCancelar = () => {
    // apenas fecha o modal
    setPlacaListenner(null);
    onClose();
  };

  return (
    <Modal
      title="Confirmar veículo"
      isOpen={isOpen}
      onClose={onCancelar}
      footer={<div></div>}
    >
      <div>
        <div className={styles["info-container"]}>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Placa:</span>{" "}
            {placaListenner?.placa}
          </div>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Modelo:</span>{" "}
            {placaListenner?.modelo}
            <span style={{ margin: "0 4px" }}>•</span>
            <span className={styles["info-label"]}>Cor:</span>{" "}
            {placaListenner?.cor}
          </div>
          <div className={styles["info-item"]}>
            <span className={styles["info-label"]}>Proprietário:</span>{" "}
            {placaListenner?.aluno?.nome || placaListenner?.docente?.nome}
            <span style={{ margin: "0 4px" }}>•</span>
            <span className={styles["info-label"]}>Categoria:</span>{" "}
            {placaListenner?.aluno ? "Aluno" : "Docente"}
          </div>
        </div>

        <input
          type="text"
          placeholder="Buscar vaga..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />

        <ul
          style={{
            maxHeight: "150px",
            overflowY: "auto",
            marginBottom: "16px",
          }}
        >
          {vagasFiltradas.map((vaga) => (
            <li
              key={vaga.id}
              className={`${styles["vaga-item"]} ${
                vagaSelecionada?.id === vaga.id ? styles["selected"] : ""
              }`}
              onClick={() => setVagaSelecionada(vaga)}
            >
              {vaga.numero}
            </li>
          ))}
        </ul>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
        >
          <button onClick={onCancelar} className={styles["botao-cancelar"]}>
            Cancelar
          </button>
          <button
            onClick={() => vagaSelecionada && onConfirmar(vagaSelecionada)}
            disabled={!vagaSelecionada}
            className={styles["botao-confirmar"]}
          >
            Confirmar Entrada
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ModalComPlaca;
