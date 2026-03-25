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

### 5. Configure the n8n AI Agent (System Prompt)

After importing the workflow from `n8n/n8n.chatbot.workflow.json` into your n8n instance, you need to configure the **AI Agent** node with your own system prompt.

Open the **AI Agent** node and replace the placeholder `systemMessage` with your personalized prompt. A well-crafted system prompt is **the key** to making your avatar accurate and useful for recruiters.

Your prompt should include the following sections, written in **Markdown format** for well-structured responses:

#### 📇 Identity & Contact Info

Provide everything a recruiter needs to reach you:

- First name, Last name
- Phone number & Email
- LinkedIn, GitHub / Portfolio URLs
- Location, mobility & remote preferences

#### 💼 Professional Experience

Describe **each position in detail**:

- Job title & Company name
- Start date → End date
- Tech stack used
- Key responsibilities and achievements

> 💡 The more detail you provide, the better the AI can answer specific questions about your background.

#### 🎓 Education & Certifications

List your degrees, training programs, and certifications with dates.

#### 🛠️ Skills

Group your skills by category:

- **Frontend:** React, Vue.js, TypeScript…
- **Backend:** Node.js, PHP/Symfony, Python…
- **DevOps:** Docker, CI/CD, AWS…
- **Soft skills:** Team leadership, Agile/Scrum…

#### 🤖 Behavior & Response Guidelines

Tell the LLM **how** it should behave:

- Answer in **first person** as if it is you
- Use **Markdown formatting**: headings (`##`, `###`), bullet points, **bold**, sub-points
- Stay professional but friendly
- Be honest when information is missing
- Give concrete examples from your experience for technical questions

#### 💬 Sample Q&A

Provide example questions with ideal answers so the LLM learns your tone and style:

| Question | Answer example |
|---|---|
| *Can you tell me about yourself?* | I'm John, a Senior Fullstack Developer with 7 years of experience… |
| *What is your expected salary?* | My range is 55k€–65k€ gross/year depending on the package. |
| *Are you available?* | Yes, with a 1-month notice period. |
| *What are your strengths?* | Versatility across the stack, autonomy, and team spirit. |

> ⚠️ **Don't forget to also configure your OpenAI credentials** in the *OpenAI Chat Model* node — the workflow ships without credentials for security reasons.

## Project Structure

```
AvatarJobFinder/
├── frontend/          # React 19 + Vite application
├── backend/           # Symfony 7.4 API
├── n8n/               # n8n workflow (AI chatbot agent)
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
