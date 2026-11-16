<div align="center">

# TIQNEST ✳
### IT support that just works.

**Report it. Work through it. Get back to your day.**

A connected help desk for employees and the IT teams behind them.

[**Explore the live website ↗**](https://tiqnest.netlify.app/) · [**Try the demo ↗**](https://tiqnest.netlify.app/login)

![React](https://img.shields.io/badge/React_18-33453a?logo=react&logoColor=f4ecd6)
![TypeScript](https://img.shields.io/badge/TypeScript-33453a?logo=typescript&logoColor=f4ecd6)
![Java](https://img.shields.io/badge/Java_21-33453a?logo=openjdk&logoColor=f4ecd6)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-33453a?logo=springboot&logoColor=f4ecd6)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-33453a?logo=postgresql&logoColor=f4ecd6)

**Frontend on Netlify · Backend on Render · Database on Neon**

</div>

---

## Start here: recruiter demo

Open **[tiqnest.netlify.app/login](https://tiqnest.netlify.app/login)** and use a demo account below. No signup is required.

| Experience | Email | Password |
|---|---|---|
| **IT administrator** | `Christine@demo.com` | `pwd` |
| **Employee** | `Bahman@demo.com` | `pwd` |
| **Employee — second perspective** | `Amin@demo.com` | `pwd` |

These are intentionally public demo credentials, defined in [`backend/src/main/resources/data.sql`](backend/src/main/resources/data.sql). They are for exploring the project with fictional data, not personal or sensitive information. The hosted database may change as visitors try the app; the account values above are verified against the seed file rather than a fresh live login.

### A quick tour

1. **Meet the product.** Visit the [public homepage](https://tiqnest.netlify.app/) for the features, workflow and team story.
2. **Try the employee experience.** Sign in as Bahman or Amin. Report a sample IT issue and follow its status on the Tickets page.
3. **Explore TiqFix.** Review guided troubleshooting for common problems. You remain in control of the steps you take.
4. **Switch perspectives.** Sign out, then sign in as Christine to explore the admin dashboard, ticket queue, priorities, incidents and user management.
5. **Follow the bigger picture.** Review the outage banner and incident tools when related reports have formed an active incident.

If the backend is sleeping, the first request may take longer. Allow it time to wake up, then retry if necessary.

---

## Big ideas. Better IT days.

IT problems interrupt work. Support requests get scattered across messages, employees repeat the same reports, and teams lose sight of which problems affect everyone.

**Tiqnest brings ticket tracking, guided troubleshooting and incident detection into one connected platform.** Employees get a clear place to ask for help; administrators get a shared view of the work that needs attention.

Created as a hackathon project at Concordia, Tiqnest connects a React interface to a Java REST API and a persistent PostgreSQL database.

## What you can explore

| Capability | What it does |
|---|---|
| **Smart ticket management** | Create support requests and follow status, priority, assignment and progress. |
| **TiqFix — guided troubleshooting** | Explore IT-approved steps for issues such as VPN disconnections, printers, browser cache and connectivity. Commands do not run silently, and completing steps does not automatically prove a repair succeeded. |
| **TiqRadar — incident detection** | Group related reports into shared incidents, surface active outages in a banner and give administrators a view of affected reports. |
| **SLA visibility** | Show deadlines and whether tickets are on track, at risk or breached. Default targets are 1 hour for critical, 4 for high, 24 for medium and 72 for low priority. |
| **Audit history** | Follow recorded ticket changes through a history timeline. |
| **Admin dashboard** | Review incidents, ticket priorities, assignments and SLA summaries. |
| **Role-based access** | Distinct employee and administrator experiences, with protected application routes and backend authentication. |
| **TiqVision — prototype** | Upload an error screenshot for AI analysis, recommended troubleshooting and an automatically populated ticket draft. Review or edit the draft, then submit it to create the ticket. The public demo currently reports AI analysis as unconfigured; the workflow requires server-side provider credentials. Explicit demo fixtures are labeled as demo results. |
| **Public landing page** | Responsive product overview, mobile navigation, illustrative ticket cards, team credits and role-aware calls to action. |

The interface uses sage green, cream and pink accents, bold typography, glass-style cards, visible keyboard focus and reduced-motion support. The authenticated homepage also has a dismissible ticket illustration.

## TiqVision: screenshot → recommended fix → ticket

1. **Upload the error.** Attach a screenshot, or capture a short screen recording. Optional text adds context.
2. **Analyze with AI.** When a provider is configured, TiqVision extracts the visible issue, suggests a possible cause and selects applicable approved troubleshooting remedies.
3. **Prepare the ticket automatically.** The analysis populates a title, description, category, affected system and suggested priority.
4. **Review and submit.** Edit the generated details if needed, then choose **Create IT ticket** or **Submit ticket**. Only this action saves a ticket; uploading or analyzing alone does not submit one.
5. **Follow through.** Try the suggested TiqFix steps or track the created ticket. Related reports may be linked to an active incident.

**Live demo status:** the deployed backend returned `aiConfigured: false` when checked on November 16, 2026. Screenshot analysis is therefore unavailable until an administrator configures the AI provider in Render. Text entry remains available. Recommendations are suggestions, not proof that an issue has been fixed.

## Deployment: three services, one application

```text
Employee or administrator
          │
          ▼
NETLIFY — React + TypeScript frontend
https://tiqnest.netlify.app
          │ HTTPS REST requests + session token
          ▼
RENDER — Java / Spring Boot backend
Authentication · Tickets · TiqFix · Incidents · SLA · Audit
          │ PostgreSQL connection
          ▼
NEON — Managed PostgreSQL database
Users · Tickets · Incidents · Application records
```

| Layer | Hosting | Responsibility |
|---|---|---|
| **Frontend** | **Netlify** | Serves the Vite production build and routes browser navigation back to React Router. |
| **Backend** | **Render** | Runs the Spring Boot API using the repository's Dockerfile. |
| **Database** | **Neon** | Hosts the PostgreSQL database used by the backend. |

The public landing page renders without backend API requests. Signing in and using application features requires the Render API. Database access stays on the backend.

### Hosting configuration

[`netlify.toml`](netlify.toml) defines the frontend base directory (`frontend`), build command (`npm run build`), output directory (`dist`), Node.js 20 and the single-page-app fallback.

| Service | Variable | Purpose |
|---|---|---|
| Netlify | `VITE_API_BASE_URL` | Public Render API base URL, including `/api`. Vite embeds it during the build. |
| Render | `SPRING_DATASOURCE_URL` | Neon PostgreSQL JDBC connection URL with the required SSL settings. |
| Render | `SPRING_DATASOURCE_USERNAME` | Neon database username. |
| Render | `SPRING_DATASOURCE_PASSWORD` | Neon database password; configure through the hosting environment. |
| Render | `CORS_ALLOWED_ORIGINS` | Allowed frontend origin, including `https://tiqnest.netlify.app`. |
| Render | `PORT` | Runtime port supplied by the hosting platform. |
| Render | `ANTHROPIC_API_KEY` | Optional server-side key for TiqVision's AI integration. |
| Render | `ANTHROPIC_MODEL` | Provider model identifier available to the configured account. |
| Render | `TIQNEST_DEMO_FIXTURES` | Optional, explicitly labeled triage demo fixtures; disabled by default. |

Changing a frontend environment variable requires a new frontend build. Keep actual infrastructure credentials and AI keys in hosting settings or ignored local environment files. The public demo passwords above are application test accounts, not infrastructure credentials.

See [`docs/deployment.md`](docs/deployment.md) for the deployment walkthrough and troubleshooting.

## Technology

| Area | Stack |
|---|---|
| Interface | React 18, TypeScript, React Router, Bootstrap / React Bootstrap, custom CSS |
| Frontend tooling | Vite, npm |
| API | Java 21, Spring Boot, Spring Data JPA |
| Java tooling | Gradle wrapper, MapStruct, Lombok |
| Persistence | PostgreSQL; H2 for backend tests |
| Local infrastructure | Docker Compose, PostgreSQL 16, pgAdmin |
| Hosting | Netlify, Render, Neon |

## Routes and access

| Route | Page | Access |
|---|---|---|
| `/` | Public landing page | Everyone |
| `/login` | Sign in | Everyone |
| `/home` | Authenticated homepage | Signed-in users |
| `/tickets` | Tickets | Signed-in users |
| `/fix` | TiqFix | Signed-in users |
| `/vision` | TiqVision | Signed-in users |
| `/dashboard` | Admin dashboard | Administrators |
| `/users` | User management | Administrators |

Successful login opens `/home`. Landing-page calls to action send returning employees to `/home` and administrators to `/dashboard`. The public landing and login pages do not show the authenticated navbar or outage banner.

## Run locally

**Prerequisites:** Git, Node.js 20 or newer, Java 21 and Docker Desktop. The Gradle wrapper is included.

### 1. Clone

```bash
git clone https://github.com/ArushiNaik/TIQNest.git
cd TIQNest
```

Optionally copy `.env.example` to `.env` for Docker Compose settings:

```bash
cp .env.example .env
```

PowerShell equivalent: `Copy-Item .env.example .env`. When running Spring directly, export any customized settings into the process environment; copying a Compose `.env` file alone does not configure every process.

### 2. Start the database and backend

```bash
docker compose up -d
./gradlew :backend:bootRun
```

On Windows, use `./gradlew.bat :backend:bootRun`.

Alternatively, run the backend and database together in Docker:

```bash
docker compose --profile app up -d --build
```

Choose one backend option to avoid competing processes on port 8080.

| Local service | Address |
|---|---|
| Backend API | `http://localhost:8080/api` |
| PostgreSQL | `localhost:5434`, database `ItHelpDesk` by default |
| pgAdmin | `http://localhost:9000` |

For pgAdmin's connection to the Compose database, use host `db` and port `5432`. Local credentials and overrides are documented in `.env.example` and `docker-compose.yml`.

### 3. Start the frontend

In a separate terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open **http://localhost:5173**. The frontend defaults to `http://localhost:8080/api`. To use another backend, set `VITE_API_BASE_URL` in a local Vite environment file or process environment and restart Vite.

The database seed defines the demo accounts listed above. PostgreSQL data persists in the Docker volume across ordinary restarts.

### 4. Build and test

From the repository root:

```bash
npm --prefix frontend run build
./gradlew :backend:test
```

On Windows, use `./gradlew.bat :backend:test`. Backend tests use the H2 test profile and do not call the real AI provider.

To preview the production frontend build:

```bash
npm --prefix frontend run preview
```

Frontend builds and focused browser checks were completed for the landing-page and dismiss-button changes. These checks do not substitute for a full live backend integration test.

## API overview

Application endpoints require `Authorization: Bearer <token>`, except login. Role and ownership rules apply to protected operations.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate and return session information |
| `GET` | `/api/auth/me` | Read the current user |
| `POST` | `/api/auth/logout` | End the session |
| `GET`, `POST` | `/api/tickets` | List or create tickets |
| `GET` | `/api/tickets/queue` | View the support queue |
| `GET`, `PATCH` | `/api/tickets/{id}` | Read or update a ticket |
| `GET` | `/api/tickets/{id}/history` | Read the ticket's audit history |
| `GET` | `/api/incidents/active` | Read active incidents |
| `PATCH` | `/api/incidents/{id}/resolve` | Resolve an incident |
| `GET` | `/api/sla/summary`, `/api/sla/alerts` | Read SLA information |
| `GET` | `/api/remediations/catalog` | Browse troubleshooting remedies |
| `POST` | `/api/remediations/recommend` | Request remedy recommendations |
| `GET`, `POST` | `/api/remediations/attempts` | Read or record troubleshooting attempts |
| `GET` | `/api/triage/status` | Check triage availability |
| `POST` | `/api/triage/classify`, `/api/triage/analyze` | Text classification or multipart evidence analysis |

Example using a seeded account against the local backend:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Christine@demo.com","password":"pwd"}'
```

## Repository map

```text
TIQNest/
├── frontend/
│   └── src/
│       ├── pages/          Landing, login, tickets, TiqFix, TiqVision, operations
│       ├── services/       API configuration and session helpers
│       ├── types/          Shared frontend models
│       └── App.tsx         Public routes and access guards
├── backend/
│   └── src/
│       ├── main/           Java API, application configuration and seed data
│       └── test/           Backend tests
├── docs/                   Deployment and project documentation
├── Dockerfile              Backend container build
├── docker-compose.yml      Local database, pgAdmin and optional backend
├── netlify.toml            Frontend build and SPA redirects
├── .env.example            Local environment template
└── gradlew / gradlew.bat    Gradle wrappers
```

Backend features are organized around users, tickets, incidents, SLA, audit history, remediation and triage.

## Project scope and next steps

Tiqnest is a hackathon portfolio project with a public demo. Shared test data can change, and the demo accounts are intentionally discoverable. TiqVision remains labeled as a prototype: the public Render API currently reports `aiConfigured: false`. Live screenshot analysis must be enabled and verified before it can be advertised as available on the hosted demo.

Potential next steps include stronger production account management, broader end-to-end coverage, validated screenshot triage and continued accessibility testing.

## The people behind Tiqnest

**Ilian Adeleke · Arushi Naik · Malick Konate · Jacky Bolap**

Built at Hackathon Concordia to reimagine everyday IT support.

Explore more web, backend, mobile and game projects in [Arushi Naik’s portfolio](https://github.com/ArushiNaik).

---

<div align="center">

**Less confusion. Faster troubleshooting. Better visibility.**

[**Take Tiqnest for a spin ↗**](https://tiqnest.netlify.app/login)

</div>
