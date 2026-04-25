# ALIRA — Autism Care Companion

> **ALIRA** (Autism Learning and Intervention Resource App) is a web application built for Filipino parents and guardians of children with autism. It brings together evidence-based learning modules, AI-powered guidance, a nearby clinic finder with QR-based clinic check-in, progress tracking, and bilingual (English / Filipino) support — all in one accessible platform.

**Live URL:** [alira-autism-care-companion.manus.space](https://alira-autism-care-companion.manus.space)

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Admin Access](#admin-access)
5. [Google Integrations](#google-integrations)
6. [Database Schema](#database-schema)
7. [Learning Modules](#learning-modules)
8. [Environment Variables](#environment-variables)
9. [Getting Started (Local Development)](#getting-started-local-development)
10. [Project Structure](#project-structure)
11. [Bilingual Support (i18n)](#bilingual-support-i18n)
12. [Future Enhancements](#future-enhancements)

---

## Project Overview

ALIRA was designed with a single mission: to make autism care more accessible for Filipino families. Many parents in the Philippines face barriers to quality autism support — limited access to specialists, language gaps in available resources, and difficulty navigating the healthcare system. ALIRA addresses these gaps by providing a structured, compassionate, and locally relevant digital companion.

The application supports multiple child profiles per guardian, tracks developmental progress over time, connects families to nearby autism-specialized clinics, and offers ALI — an AI chatbot trained specifically on autism care guidance for Filipino families.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS 4, shadcn/ui, Framer Motion, Recharts |
| **Backend** | Express 4, tRPC 11 (end-to-end type safety) |
| **Database** | MySQL / TiDB via Drizzle ORM |
| **Authentication** | Custom email/password auth with JWT session cookies (bcryptjs) |
| **AI / LLM** | Manus Built-in Forge API (OpenAI-compatible, server-side only) |
| **Maps** | Google Maps JavaScript API (via Manus proxy — no API key required) |
| **QR Codes** | `qrcode.react` (client-side SVG generation) |
| **File Storage** | AWS S3 (via Manus storage helpers) |
| **Language** | TypeScript (strict, zero errors enforced) |
| **Testing** | Vitest (14 tests, all passing) |
| **Runtime** | Node.js 22, pnpm |

---

## Features

ALIRA is organized around six core areas, each accessible from the persistent sidebar navigation.

**Dashboard** provides a personalized overview for each child profile, including average activity scores, available modules, diagnosis status, and a quick-access card to find nearby clinics. Guardians managing multiple children can switch between profiles using a tab interface.

**Learning Modules** offers six structured coaching activities grounded in evidence-based therapeutic frameworks (DIR/Floortime, TEACCH, NDBI). Each module includes an overview, a step-by-step coaching activity with markdown-rendered instructions, and a scoring flow where guardians rate their child's response on a five-level scale (Excellent → Needs Support) with optional notes.

**Progress Report** visualizes each child's activity score history with a Recharts line chart, summary statistics (average, highest, lowest scores, total activities completed), and a chronological activity log.

**Nearby Clinics** uses the Google Maps JavaScript API and Places Text Search to surface autism-specialized clinics and therapy centers across the Philippines. Guardians can toggle between a map view and a list view, get directions, and generate a **QR Demographics Card** — a QR code pre-loaded with the child's name, age, birthdate, gender, and diagnosis status — to speed up registration at clinic reception.

**ALI Chat** is a conversational AI companion powered by the Manus LLM API. ALI is prompted to be culturally sensitive to Filipino families, evidence-informed, and compassionate. Chat history is persisted in the database per user.

**Settings** allows guardians to update their profile, change their password, switch the app language between English and Filipino (persisted to the database), and manage in-app notification preferences.

---

## Admin Access

The admin panel is accessible at `/admin` and is protected by a separate username/password login (not the same as guardian accounts).

| Field | Value |
|---|---|
| **Username** | `alira_admin` |
| **Password** | `AliraAdmin2024!` |
| **URL** | `/admin` |

> **Security note:** These are the default credentials. It is strongly recommended to change the admin password before deploying to a production environment. The credentials are currently stored as constants in `server/routers.ts` and should be moved to environment variables for any public deployment.

The admin panel provides read access to all users, children records, activity scores, appointments, and chat sessions. Appointment statuses can be updated directly from the admin panel.

---

## Google Integrations

ALIRA integrates with the Google Maps Platform through the **Manus Maps Proxy**, which handles API key authentication automatically — no Google API key needs to be configured by the developer.

| Google Service | How It Is Used |
|---|---|
| **Maps JavaScript API** | Renders the interactive map on the Clinics page (map/satellite view, zoom, pan) |
| **Places Text Search API** | Searches for autism clinics and therapy centers by keyword and location radius |
| **Places Details** | Retrieves clinic name, address, rating, user rating count, and opening hours |
| **Geocoding API** | Available via `google.maps.Geocoder` for address-to-coordinate resolution |
| **Directions API** | Powers the "Get Directions" button, opening Google Maps navigation in a new tab |
| **Geometry Library** | Available for distance calculations between coordinates |

All Google Maps functionality is initialized in `client/src/components/Map.tsx` via the `onMapReady` callback pattern. The proxy URL is injected at runtime from `VITE_FRONTEND_FORGE_API_URL`, so no `.env` changes are needed for maps to work in the Manus-hosted environment.

---

## Database Schema

The database uses MySQL (TiDB-compatible) managed through Drizzle ORM. Migrations are generated with `pnpm drizzle-kit generate` and applied via the Manus `webdev_execute_sql` tool.

| Table | Purpose |
|---|---|
| `users` | Guardian accounts — name, email, passwordHash, language preference, role |
| `children` | Child profiles linked to a guardian — name, age, birthdate, gender, diagnosis status |
| `modules` | Learning module content — title, description, coaching activity, age group, skill category |
| `activity_scores` | Score records linking a child, module, score value (0–100), and optional notes |
| `appointments` | Clinic appointment bookings with status tracking (pending / confirmed / cancelled) |
| `chat_messages` | ALI chat history per user — role (user/assistant), content, timestamp |
| `notifications` | In-app progress notifications — title, message, read status, linked to a user |

All timestamps are stored as UTC-based Unix milliseconds. The `users.role` field supports `admin` and `user` values for role-based access control.

---

## Learning Modules

Six modules are seeded into the database on first run, organized by age group and skill category.

| Module Title | Age Group | Skill Category |
|---|---|---|
| Exploring the World Through Play | Toddler (2–3) | Cognitive |
| First Connections: Bonding and Early Talking | Toddler (2–3) | Social |
| Routines, Comfort, and Feeling Safe | Toddler (2–3) | Integrative |
| Imagination, Stories, and Early Thinking | Early Childhood (4–6) | Cognitive |
| Making Friends and Playing Together | Early Childhood (4–6) | Social |
| Feelings, Flexibility, and Big Emotions | Early Childhood (4–6) | Integrative |

Each module includes theoretical foundations drawn from DIR/Floortime, TEACCH, and NDBI frameworks, a weekly tip, and a detailed step-by-step coaching activity rendered with markdown.

---

## Environment Variables

The following environment variables are injected automatically by the Manus platform and do not need to be set manually in `.env` files during hosted development.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MySQL/TiDB connection string |
| `JWT_SECRET` | Session cookie signing secret |
| `VITE_APP_ID` | Manus OAuth application ID |
| `OAUTH_SERVER_URL` | Manus OAuth backend base URL |
| `VITE_OAUTH_PORTAL_URL` | Manus login portal URL (frontend) |
| `OWNER_OPEN_ID` | Owner's Manus Open ID |
| `OWNER_NAME` | Owner's display name |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API base URL (server-side LLM, storage, notifications) |
| `BUILT_IN_FORGE_API_KEY` | Bearer token for server-side Manus API calls |
| `VITE_FRONTEND_FORGE_API_KEY` | Bearer token for frontend Manus API calls (maps proxy) |
| `VITE_FRONTEND_FORGE_API_URL` | Manus built-in API URL for frontend (maps proxy) |

For local development outside the Manus platform, create a `.env` file at the project root and populate these values from your Manus project dashboard.

---

## Getting Started (Local Development)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd alira

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Fill in the required values in .env

# 4. Generate and apply database migrations
pnpm drizzle-kit generate
# Then apply the generated SQL via your database client

# 5. Start the development server
pnpm dev
# App runs at http://localhost:3000

# 6. Run tests
pnpm test
```

The development server serves both the Express API and the Vite React frontend on port 3000. tRPC procedures are available under `/api/trpc`, and the OAuth callback is handled at `/api/oauth/callback`.

---

## Project Structure

```
alira/
├── client/
│   ├── src/
│   │   ├── pages/          # Page-level components (Home, Dashboard, Modules, etc.)
│   │   ├── components/     # Reusable UI components (AppShell, Map, AIChatBox, etc.)
│   │   ├── contexts/       # React contexts (LanguageContext for i18n)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/trpc.ts     # tRPC client binding
│   │   ├── App.tsx         # Route definitions and layout
│   │   └── index.css       # Global styles and Tailwind theme tokens
├── drizzle/
│   ├── schema.ts           # Database table definitions and types
│   └── migrations/         # Generated SQL migration files
├── server/
│   ├── routers.ts          # All tRPC procedures (auth, children, modules, etc.)
│   ├── db.ts               # Database query helpers
│   ├── moduleData.ts       # Seed data for the 6 learning modules
│   ├── storage.ts          # S3 file storage helpers
│   └── _core/              # Framework plumbing (auth, context, LLM, maps, OAuth)
├── shared/
│   └── const.ts            # Shared constants (cookie name, etc.)
└── todo.md                 # Feature and bug tracking
```

---

## Bilingual Support (i18n)

ALIRA supports **English** and **Filipino (Tagalog)** throughout the entire application. Language selection is available in the Settings page and is persisted to the user's database record, so the chosen language is restored on every subsequent login.

The translation system is implemented as a React context (`client/src/contexts/LanguageContext.tsx`) containing a typed dictionary for all UI strings across every page and component. Switching languages triggers an instant app-wide re-render with no page reload required.

---

## Future Enhancements

The following features are identified as high-value additions for future development iterations.

**Appointment Scheduling System.** A full appointment booking flow — allowing guardians to select a clinic from the map, choose a date and time, and receive confirmation — was part of the original scope. The database schema (`appointments` table) and backend procedures are already in place; the remaining work is building the booking UI and integrating clinic availability data.

**Dynamic Family Count on Sign-Up Page.** The "Families" stat on the Sign-Up page currently shows a static value. Wiring it to a live `trpc.admin.getUserCount` query would make the number grow automatically as real users register, providing authentic social proof.

**Push Notifications.** The in-app notification system is functional, but browser push notifications (via the Web Push API or a service like Firebase Cloud Messaging) would allow ALIRA to remind guardians about upcoming activities and progress milestones even when the app is not open.

**Therapist / Specialist Portal.** A separate role (`therapist`) could be introduced to allow licensed autism specialists to review a child's progress reports, leave clinical notes, and recommend specific modules — bridging the gap between home-based coaching and professional care.

**Offline Mode and PWA Support.** Many Filipino families in rural areas have intermittent internet connectivity. Converting ALIRA into a Progressive Web App (PWA) with service worker caching would allow guardians to access module content and log activity scores offline, syncing when connectivity is restored.

**Expanded Module Library.** The current six modules cover toddlers (2–3) and early childhood (4–6). Future modules could extend coverage to school-age children (7–12), adolescents, and topic-specific guides (e.g., sensory regulation, AAC communication strategies, transition planning for adulthood).

**Telehealth Integration.** Embedding a video consultation feature — connecting guardians directly with autism specialists or occupational therapists via WebRTC — would significantly increase ALIRA's clinical value, particularly for families in provinces far from specialized clinics.

**Gamification and Streaks.** Introducing a streak system (consecutive days of module completion), achievement badges, and a visual "growth tree" for each child could improve long-term engagement and motivate consistent use of the coaching activities.

**Multi-Language Expansion.** Beyond English and Filipino, adding support for regional Philippine languages (Cebuano, Ilocano, Hiligaynon) would make ALIRA accessible to a significantly broader population across the archipelago.

**Data Export and Clinical Reporting.** Allowing guardians to export a child's full progress report as a PDF — formatted for clinical handoff — would make ALIRA a useful tool during diagnostic appointments and therapy reviews.

---

## License

This project was built as a hackathon project. All rights reserved by the project authors. The codebase is not licensed for redistribution without explicit permission.

---

*Built with care for Filipino families navigating autism — one module at a time.*
