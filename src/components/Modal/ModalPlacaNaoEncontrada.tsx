import { useData } from "../../hooks/useData";
import Modal from "./Modal";
import styles from "./ModalComPlaca.module.css"; // Reaproveitando os estilos

interface ModalPlacaNaoEncontradaProps {
  isOpen: boolean;
  onClose: () => void;
  placa?: string;
  mensagemErro?: string;
}

function ModalPlacaNaoEncontrada({
  isOpen,
  onClose,
  placa,
  mensagemErro = "Veículo não encontrado no sistema.",
}: ModalPlacaNaoEncontradaProps) {
  const { setPlacaNEncontrada } = useData();

  const onCancel = () => {
    setPlacaNEncontrada(undefined)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Placa não encontrada"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onCancel} className={styles["botao-cancelar"]}>
            Fechar
          </button>
        </div>
      }
    >
      <div className={styles["info-container"]}>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Placa enviada:</span> {placa}
        </div>
        <div className={styles["info-item"]}>
          <span className={styles["info-label"]}>Erro:</span> {mensagemErro}
        </div>
        <p style={{ marginTop: "12px", color: "#ef4444", fontWeight: 500 }}>
          Verifique se a placa está cadastrada corretamente ou cadastre um novo
          veículo.
        </p>
      </div>
    </Modal>
  );
}

export default ModalPlacaNaoEncontrada;
