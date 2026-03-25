# AvatarJobFinder

An AI-powered interactive CV / job finder application featuring a chatbot avatar that answers questions about the candidate's profile, experience, and skills.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, i18next, Deep Chat  |
| Backend    | PHP 8.2+, Symfony 7.4               |
| AI Engine  | n8n (workflow automation)            |
| Database   | MySQL 8.0                           |
| Infra      | Docker & Docker Compose              |

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- (Optional) Node.js 20+ and PHP 8.2+ for local development without Docker

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/AvatarJobFinder.git
cd AvatarJobFinder
```

### 2. Configure environment variables

Create a `.env` file at the project root with the following variables:

```dotenv
# Domain
WEBSITE_DOMAIN=yourdomain.com

# n8n (AI workflow engine)
N8N_PORT=5678
N8N_WEBHOOK_URL=https://yourdomain.com:5678/
N8N_DB_NAME=<n8n_db_name>
N8N_DB_USER=<n8n_user_name>
N8N_DB_PASSWORD=<n8n_db_password>

# Backend (Symfony API)
BACKEND_DB_NAME=<backend_db_name>
BACKEND_DB_USER=<backend_db_user>
BACKEND_DB_PASSWORD=<backend_db_password>
BACKEND_URL=https://yourbackenddomain.com/api

# MySQL
DB_HOST=mysql
DB_PORT=3306
DB_ROOT_PASSWORD=<db_root_password>
```

> ⚠️ **Do not commit the `.env` file.** It contains sensitive credentials. 

### 3. Start with Docker Compose (development)

```bash
docker compose up -d
```

This will start:

| Service       | URL                          |
|---------------|------------------------------|
| React (dev)   | http://localhost:5173        |
| Symfony API   | http://localhost:8000        |
| n8n           | http://localhost:5678        |
| MySQL         | localhost:3306               |

### 4. Start with Docker Compose (production)

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Project Structure

```
AvatarJobFinder/
├── frontend/          # React 19 + Vite application
├── backend/           # Symfony 7.4 API
├── docker-compose.yml
└── docker-compose.prod.yml
```

## Running Tests

### Frontend (Vitest)

```bash
cd frontend
npm run test
```

### Backend (PHPUnit)

```bash
cd backend
php bin/phpunit
```

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)**.

**You are free to:**
- ✅ Fork, clone and use this code
- ✅ Modify and adapt it
- ✅ Share it with others

**Under the following conditions:**
- ℹ️ **Attribution** — You must give appropriate credit and indicate if changes were made.
- 🚫 **NonCommercial** — You may **not** use this project for commercial purposes.

See the full license text in the [LICENSE](./LICENSE) file or visit:
[https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

---

© 2026 David Vander Elst
