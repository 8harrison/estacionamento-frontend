import { useState } from "react";
import styles from "./OcuparVagaModalContent.module.css";
import { useData } from "../../hooks/useData";
import type { Veiculo } from "../../types";

interface Props {
  onConfirm: (veiculo: Veiculo) => void;
}

export default function OcuparVagaModalContent({ onConfirm }: Props) {
  const [busca, setBusca] = useState("");
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(
    null
  );
  const { veiculos } = useData();

  const veiculosFiltrados = veiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(busca.toLowerCase()) ||
      v.modelo.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSlecionar = (veiculo: Veiculo) => {
    setVeiculoSelecionado(veiculo);
    setBusca(`${veiculo.placa} – ${veiculo.modelo}`);
  };

  return (
    <div className={styles.container}>
      <h2>Ocupar Vaga</h2>
      <input
        type="text"
        placeholder="Buscar por placa ou modelo..."
        className={styles.input}
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setVeiculoSelecionado(null);
        }}
      />

      {busca && (
        <ul className={styles.lista}>
          {veiculosFiltrados.map((v) => (
            <li
              key={v.id}
              className={`${styles.item} ${
                veiculoSelecionado?.id === v.id ? styles.selecionado : ""
              }`}
              onClick={() => handleSlecionar(v)}
            >
              {v.placa} – {v.modelo}
            </li>
          ))}
          {veiculosFiltrados.length === 0 && !veiculoSelecionado &&(
            <li className={styles.naoEncontrado}>Nenhum veículo encontrado</li>
          )}
        </ul>
      )}

      <button
        className={styles.confirmar}
        disabled={!veiculoSelecionado}
        onClick={() => veiculoSelecionado && onConfirm(veiculoSelecionado)}
      >
        Confirmar Ocupação
      </button>
    </div>
  );
}
