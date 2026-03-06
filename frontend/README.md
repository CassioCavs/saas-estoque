# StockWise — Inventory Management Frontend

A modern SaaS-grade inventory dashboard built with **React + Vite + TailwindCSS**.

---

## Tech Stack

| Tool           | Version |
|----------------|---------|
| React          | 18      |
| Vite           | 5       |
| TailwindCSS    | 3       |
| Axios          | 1.6     |
| React Router   | 6       |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure your API URL

Copy `.env.example` to `.env.local` and update the URL:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:8000/api
```

> Replace with your actual backend base URL.

### 3. Run in development

```bash
npm run dev
```

Visit `http://localhost:5173`

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx       # Persistent left navigation
│   ├── Layout.jsx        # Auth-guarded page wrapper + top bar
│   ├── ItemsTable.jsx    # Data table with edit/delete actions
│   └── ItemForm.jsx      # Shared create/edit form
│
├── pages/
│   ├── Login.jsx         # Centered login card
│   ├── Dashboard.jsx     # Stats overview + quick actions
│   ├── Items.jsx         # Items list with search
│   ├── CreateItem.jsx    # New item form page
│   └── EditItem.jsx      # Edit prefilled form page
│
├── services/
│   └── api.js            # Axios instance + auth interceptors + endpoints
│
├── hooks/
│   └── useAuth.js        # Token management + logout + isAuthenticated
│
├── App.jsx               # React Router setup
├── main.jsx              # Entry point
└── index.css             # TailwindCSS + custom component classes
```

---

## API Integration

### Base URL

Configured in `src/services/api.js` via `VITE_API_URL` env variable.

### Auth Header

Every request automatically includes:
```
Authorization: Bearer <token>
```

Set by the Axios request interceptor in `services/api.js`.

### Expected Login Response

The login handler in `pages/Login.jsx` handles these common shapes:

```json
{ "access_token": "...", "user": { "name": "...", "email": "..." } }
{ "token": "...", "user": { ... } }
{ "data": { "token": "...", "user": { ... } } }
```

Adjust `pages/Login.jsx` line ~48 if your backend uses a different key.

### Items API shape

The items list handler normalizes:
```json
[...]                          // plain array
{ "items": [...] }
{ "data": [...] }
```

Adjust `pages/Items.jsx` if needed.

---

## Auth Flow

1. User submits login form → POST `/auth/login`
2. Token saved in `localStorage` via `useAuth.saveSession()`
3. All routes wrapped by `<Layout>` which calls `useAuth.isAuthenticated`
4. If no token → redirected to `/login`
5. 401 responses → Axios interceptor clears token + redirects

---

## Customisation

| What to change        | Where                          |
|-----------------------|--------------------------------|
| API base URL          | `.env.local` → `VITE_API_URL`  |
| Login endpoint        | `services/api.js` → `authService.login` |
| Token response key    | `pages/Login.jsx` line ~48     |
| Color palette         | `tailwind.config.js`           |
| Sidebar brand name    | `components/Sidebar.jsx`       |
