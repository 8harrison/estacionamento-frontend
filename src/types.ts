interface Vaga {
  id: string;
  numero: string;
  setor: string;
  tipo: string;
  ocupada: boolean;
  veiculo?: Veiculo
}

interface Docente {
  id: string;
  nome: string;
  matricula: string;
  departamento: string;
  veiculos: Veiculo[];
  telefone?: string;
  email?: string
  ativo?: boolean
}

interface Aluno {
  id: string;
  nome: string;
  matricula: string;
  turno?: string;
  veiculos: Veiculo[];
  telefone?: string
  email?: string
  ativo?: boolean
}

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  cor: string;
  docente?: Docente
  aluno?: Aluno
  ativo?: boolean
}

interface Registro {
  id: string;
  data_entrada: string;
  data_saida: string | null;
  veiculoId: string;
  vagaId: string;
  vaga: Vaga;
  veiculo: Veiculo;
}

const TipoVaga  = {
  comum: 'Comum',
  prioridade: 'Prioritária',
  docente: 'Docente',
  todos: 'todos'
}

const StatusVaga = {
  todos: "todos",
  livre: "livre",
  ocupada: "ocupada",
}
type StatusVaga = keyof typeof StatusVaga

export { TipoVaga, StatusVaga }
export type { Vaga, Docente, Aluno, Veiculo, Registro}


export type TipoVaga = keyof typeof TipoVaga
