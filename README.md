# StockWise - Sistema de Gestão de Estoque (SaaS)

Um sistema moderno de gerenciamento de estoque desenvolvido com **FastAPI** no backend e **React (Vite + Tailwind CSS)** no frontend.

## 🚀 Tecnologias Utilizadas

### Backend
- **FastAPI**: Framework web de alta performance.
- **SQLAlchemy**: ORM para interação com o banco de dados SQLite.
- **Pydantic**: Validação de dados e esquemas.
- **JWT (JSON Web Tokens)**: Autenticação segura.
- **Bcrypt**: Hashing de senhas.

### Frontend
- **React**: Biblioteca para interfaces de usuário.
- **Vite**: Ferramenta de build rápida para o frontend.
- **Tailwind CSS**: Framework CSS utilitário para estilização moderna.
- **Axios**: Cliente HTTP para chamadas à API.
- **React Router**: Navegação entre páginas.

## 📁 Estrutura do Projeto

- `backend/`: Código fonte da API FastAPI.
- `frontend/`: Código fonte da aplicação React.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- Python 3.10 ou superior
- Node.js 18 ou superior
- npm ou yarn

### Configuração do Backend

1. Entre na pasta do backend:
   ```bash
   cd backend
   ```

2. Crie e ative um ambiente virtual:
   ```bash
   python -m venv venv
   # No Windows:
   venv\Scripts\activate
   # No Linux/Mac:
   source venv/bin/activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Inicie o servidor:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   A API estará disponível em: `http://localhost:8000`
   Documentação interativa (Swagger): `http://localhost:8000/docs`

### Configuração do Frontend

1. Entre na pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em: `http://localhost:5173`

---

## ✨ Funcionalidades

- **Autenticação Segura**: Login e Registro com JWT.
- **Gestão de Produtos**: CRUD completo de produtos (nome, preço, estoque, descrição).
- **Dashboard**: Visão geral do estoque com indicadores de valor total e alertas de baixo estoque.
- **Interface Moderna**: Design responsivo e limpo utilizando Tailwind CSS.

## 📝 Notas
- O banco de dados utilizado é o SQLite (`backend/saasestoque.db`), que é criado automaticamente ao iniciar o backend pela primeira vez.
- Certifique-se de que o backend esteja rodando para que o frontend consiga carregar os dados.
