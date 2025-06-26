# Documentação do Frontend - Sistema de Gerenciamento de Estacionamento

## Visão Geral

Este projeto é o frontend para o Sistema de Gerenciamento de Estacionamento, desenvolvido com Vite, React, TypeScript e CSS Modules. O sistema permite o gerenciamento completo de alunos, docentes, veículos, vagas e registros de estacionamento, com diferentes níveis de acesso para administradores e porteiros.

## Tecnologias Utilizadas

- **Vite**: Ferramenta de build rápida para desenvolvimento frontend
- **React**: Biblioteca para construção de interfaces de usuário
- **TypeScript**: Superset tipado de JavaScript
- **CSS Modules**: Estilização modular e isolada por componente
- **Axios**: Cliente HTTP para comunicação com a API
- **React Router**: Gerenciamento de rotas e navegação

## Estrutura do Projeto

```
estacionamento-frontend/
├── public/                  # Arquivos públicos
├── src/                     # Código fonte
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Layout/          # Componentes de layout
│   │   ├── Modal/           # Componente de modal
│   │   └── Table/           # Componente de tabela
│   ├── contexts/            # Contextos React
│   │   └── AuthContext.tsx  # Contexto de autenticação
│   ├── hooks/               # Hooks personalizados
│   │   └── useAuth.ts       # Hook para acesso ao contexto de autenticação
│   ├── pages/               # Páginas da aplicação
│   │   ├── AccessDenied/    # Página de acesso negado
│   │   ├── Alunos/          # Páginas de gerenciamento de alunos
│   │   ├── Dashboard/       # Página inicial/dashboard
│   │   ├── Docentes/        # Páginas de gerenciamento de docentes
│   │   ├── Estacionamento/  # Páginas de registros de estacionamento
│   │   ├── Login/           # Página de login
│   │   ├── Usuarios/        # Páginas de gerenciamento de usuários
│   │   ├── Vagas/           # Páginas de gerenciamento de vagas
│   │   └── Veiculos/        # Páginas de gerenciamento de veículos
│   ├── services/            # Serviços
│   │   └── api.ts           # Configuração do Axios para API
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Ponto de entrada
│   └── vite-env.d.ts        # Tipos para o Vite
├── .env.example             # Exemplo de variáveis de ambiente
├── index.html               # HTML principal
├── package.json             # Dependências e scripts
├── tsconfig.json            # Configuração do TypeScript
└── vite.config.ts           # Configuração do Vite
```

## Funcionalidades Principais

### Autenticação e Autorização

- Login com JWT
- Rotas protegidas por perfil (administrador/porteiro)
- Página de acesso negado para tentativas de acesso não autorizado
- Persistência de sessão

### Gerenciamento de Alunos

- Listagem com filtros e busca
- Cadastro, edição e exclusão
- Visualização de veículos associados

### Gerenciamento de Docentes

- Listagem com filtros e busca
- Cadastro, edição e exclusão
- Visualização de veículos associados

### Gerenciamento de Veículos

- Listagem com filtros e busca
- Cadastro, edição e exclusão
- Associação com proprietários (alunos ou docentes)

### Gerenciamento de Vagas

- Visualização em grid com status visual
- Filtros por setor, tipo e status
- Cadastro, edição e exclusão
- Alteração rápida de status (livre/ocupada)
- Estatísticas de ocupação

### Registros de Estacionamento

- Registro de entrada e saída de veículos
- Listagem com filtros e busca
- Visualização detalhada de registros

### Gerenciamento de Usuários (apenas administradores)

- Listagem de usuários
- Cadastro, edição e exclusão
- Definição de perfil (administrador/porteiro)

## Fluxos de Navegação

### Fluxo de Autenticação

1. Usuário acessa a aplicação
2. É redirecionado para a página de login
3. Após login bem-sucedido, é redirecionado para o Dashboard
4. Token JWT é armazenado para autenticação em requisições subsequentes

### Fluxo de Acesso Negado

1. Usuário tenta acessar uma rota restrita ao seu perfil
2. É redirecionado para a página de Acesso Negado
3. Pode voltar para a página anterior ou ir para o Dashboard

### Fluxo de Registro de Entrada

1. Usuário acessa a página de Registros
2. Clica em "Registrar Entrada"
3. Seleciona um veículo e uma vaga disponível
4. Confirma o registro
5. É redirecionado para a lista de registros atualizada

### Fluxo de Registro de Saída

1. Usuário acessa a página de Registros
2. Localiza o registro ativo e clica em "Registrar Saída"
3. Confirma a saída
4. A vaga é liberada automaticamente
5. É redirecionado para a lista de registros atualizada

## Componentes Reutilizáveis

### MainLayout

Componente de layout principal que inclui:
- Barra lateral de navegação
- Cabeçalho com título da página
- Área de conteúdo
- Verificação de autenticação

### Modal

Componente para exibição de diálogos modais:
- Título configurável
- Conteúdo dinâmico
- Botões de ação personalizáveis
- Animações de entrada e saída

### ProtectedRoute

Componente para proteção de rotas:
- Verifica autenticação
- Verifica permissões de acesso
- Redireciona para login ou acesso negado quando necessário

## Estilização

O projeto utiliza CSS Modules para estilização, garantindo:
- Isolamento de estilos por componente
- Ausência de CSS global
- Consistência visual em toda a aplicação
- Responsividade para diferentes tamanhos de tela

Cada componente possui seu próprio arquivo .module.css com estilos específicos.

## Tratamento de Erros

O sistema implementa tratamento de erros em vários níveis:
- Validação de formulários no frontend
- Tratamento de erros de API
- Feedback visual para o usuário
- Mensagens de erro específicas
- Estados de carregamento e vazio

## Configuração e Instalação

### Pré-requisitos

- Node.js 14.x ou superior
- npm ou yarn

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
   ou
   ```bash
   yarn
   ```

3. Copie o arquivo `.env.example` para `.env` e configure a URL da API:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   ou
   ```bash
   yarn dev
   ```

5. Acesse a aplicação em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```
ou
```bash
yarn build
```

Os arquivos de build serão gerados na pasta `dist`.

## Integração com Backend

O frontend se comunica com a API backend através do Axios. A configuração está centralizada em `src/services/api.ts`, que:

- Define a URL base da API
- Configura interceptadores para incluir o token JWT em requisições
- Trata erros de autenticação
- Gerencia refresh de token quando necessário

## Considerações de Segurança

- Tokens JWT são armazenados de forma segura
- Senhas nunca são armazenadas no frontend
- Validação de dados em formulários
- Proteção contra CSRF
- Sanitização de inputs

## Melhorias Futuras

- Implementação de testes automatizados
- Modo escuro
- Exportação de relatórios
- Dashboard com gráficos e estatísticas avançadas
- Notificações em tempo real
- Suporte a múltiplos idiomas

---

Desenvolvido com ❤️ para o Sistema de Gerenciamento de Estacionamento
