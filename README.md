# EstoqueWise - SaaS Inventory & POS System

EstoqueWise is a modern, responsive, and robust Point of Sale (POS) and Inventory Management SaaS platform. It is built with a high-performance **FastAPI** backend and a dynamic **React + Vite** frontend styled with **Tailwind CSS**.

## 🚀 Technologies Used

### Backend
- **FastAPI**: High-performance web framework.
- **SQLAlchemy (Async / Sync)**: ORM for database interactions.
- **PostgreSQL (Supabase)**: Scalable relational database.
- **Pydantic**: Data validation and type hinting.
- **JWT (JSON Web Tokens)**: Secure stateless authentication.
- **Bcrypt**: Cryptographic password hashing.

### Frontend
- **React 18**: Component-based UI library.
- **Vite**: Ultra-fast frontend build tool.
- **Tailwind CSS**: Utility-first CSS framework with native Dark/Light mode support.
- **Axios**: HTTP client for API requests.
- **React Router DOM**: Client-side routing.
- **Custom Hooks** (`useFetch`, `useCart`, `useTheme`, `useDebounce`): Reusable abstractions for UI state and API data fetching.

## ✨ Key Features

- **Multi-Tenant Architecture**: Strict data isolation via `user_id` across all database models ensures SaaS compliance.
- **Advanced Point of Sale (POS)**:
  - Add products by barcode scanning or dynamic search.
  - Granular cart control with decimal quantities (e.g., Kg, Liters) and unit types.
  - Multi-method split payments (Cash, Credit, Debit, PIX) with automatic change calculation.
- **Inventory & Catalog Management**:
  - Full CRUD for Products, Categories, and Customers.
  - Stock movement history and automated low-stock alerts.
  - Automated profit margin and sale price calculations.
- **Dashboard & Analytics**:
  - Real-time metrics on total stock value, potential profit, and daily movements.
- **Modern UI & UX**:
  - Seamless Light Mode / Dark Mode toggling using CSS variables.
  - Debounced search inputs and optimized API fetching patterns.
  - Aesthetically consistent, clean, and fully responsive layout.

---

## 📁 Project Structure

- `backend/`: FastAPI application code (Layered architecture: `models`, `schemas`, `services`, `routes`).
- `frontend/`: React application code (Modular component structure, custom hooks, and unified API services).

---

## 🛠️ How to Run the Project

### Prerequisites
- Python 3.10+
- Node.js 18+
- A PostgreSQL database (or Supabase instance).

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Linux/Mac:
   source venv/bin/activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure the `.env` file referencing your PostgreSQL Database URL and JWT Secret.

5. Start the server (runs on `http://localhost:8000`):
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   Interactive Swagger documentation available at: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```

## 🏗️ Architecture & Optimization

The codebase has undergone deep optimization to ensure production readiness:
- **API Fetching**: Abstracted repetitive boilerplate through `useFetch` to prevent redundant states and hooks.
- **N+1 Query Prevention**: Eager loading (`selectinload`) implemented on SQLAlchemy relationships.
- **React Performance**: The POS interface (`Sales.jsx`) is broken down into micro-components (`PosModal`, `ProductGrid`, `CartColumn`) to prevent monolithic state re-renders, paired with `useDebounce` for typing efficiency.
