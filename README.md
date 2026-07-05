# TechWorld — E-commerce de Tecnologia

Plataforma de e-commerce especializada em produtos de tecnologia, com autenticação de usuários, carrinho de compras, checkout, histórico de pedidos e painel administrativo.

---

## Tecnologias

**Frontend**

| Tecnologia | Uso |
|---|---|
| [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | UI e tipagem |
| [Vite](https://vitejs.dev/) | Bundler e dev server |
| [React Router DOM](https://reactrouter.com/) | Roteamento |
| [Tailwind CSS](https://tailwindcss.com/) | Estilização |
| [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) | Componentes acessíveis |
| [TanStack Query](https://tanstack.com/query) | Cache e fetching de dados |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Formulários e validação |
| [next-themes](https://github.com/pacocoursey/next-themes) | Tema claro/escuro |
| [Lucide React](https://lucide.dev/) | Ícones |
| [Recharts](https://recharts.org/) | Gráficos |

**Testes**

| Tecnologia | Uso |
|---|---|
| [Vitest](https://vitest.dev/) | Test runner |
| [Testing Library](https://testing-library.com/) | Testes de componentes |
| [@vitest/coverage-v8](https://vitest.dev/guide/coverage) | Cobertura de código |

**Backend** *(em desenvolvimento)*

| Tecnologia | Uso |
|---|---|
| [.NET 10](https://dotnet.microsoft.com/) + C# | API REST |
| [ASP.NET Core Identity](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity) + JWT | Autenticação |
| [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/) | ORM |
| [PostgreSQL](https://www.postgresql.org/) | Banco de dados |
| [MediatR](https://github.com/jbogard/MediatR) | CQRS |

---

## Funcionalidades

- Autenticação (cadastro, login, logout)
- Listagem de produtos com filtros por categoria e busca
- Carrossel de produtos em destaque (ofertas, gaming, lançamentos)
- Carrinho de compras persistente
- Checkout com seleção de endereço e método de pagamento
- Histórico de pedidos
- Perfil do usuário com upload de avatar
- Gerenciamento de endereços
- Painel administrativo (CRUD de produtos)
- Tema claro/escuro
- Páginas de suporte (Central de Ajuda, Frete, Política de Devolução, Contato)

---

## Estrutura do Projeto

```
src/
├── assets/           # Imagens e recursos estáticos
├── components/       # Componentes reutilizáveis
│   ├── ui/           # Componentes base (shadcn/ui)
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── ProductCard.tsx
│   ├── ProductCarousel.tsx
│   ├── ProductGrid.tsx
│   ├── CartModal.tsx
│   ├── CheckoutModal.tsx
│   ├── ProductModal.tsx
│   └── ...
├── contexts/         # React Contexts (Auth, Cart, Category)
├── hooks/            # Custom hooks
├── pages/            # Páginas da aplicação
│   ├── Index.tsx
│   ├── Auth.tsx
│   ├── Admin.tsx
│   ├── Profile.tsx
│   ├── OrderHistory.tsx
│   ├── AddressManagement.tsx
│   └── ...
├── services/         # Camada de acesso à API
└── lib/              # Utilitários
```

---

## Rodando Localmente

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18+ e npm

```sh
# 1. Clone o repositório
git clone https://github.com/MarlonDB-003/Ecommerc-tec.git
cd Ecommerc-tec

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`.

---

## Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
VITE_API_BASE_URL=http://localhost:5274
```

> Nunca commite o arquivo `.env`. Ele já está no `.gitignore`.

---

## Testes

```sh
# Rodar todos os testes
npm test

# Rodar com cobertura de código
npm run coverage
```

Cobertura atual: ~42% (30 arquivos de teste, 250+ casos).

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run preview` | Visualiza o build de produção |
| `npm test` | Roda os testes |
| `npm run coverage` | Roda os testes com relatório de cobertura |
| `npm run lint` | Verifica o código com ESLint |

---

## Licença

Este projeto segue os termos definidos no arquivo LICENSE.
