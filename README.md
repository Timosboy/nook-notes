# Nook

A small full stack notes app: write notes, archive them, sort them with colored categories, pin the important ones, add an emoji and images. It was built for a full stack exercise.

![Nook in the light theme](docs/screenshots/light.png)

- `backend/`: REST API, NestJS + TypeORM + PostgreSQL
- `frontend/`: single page app, React + Vite + TypeScript

## Live version

Open **<https://nook.timosboy.lat>** and sign in with this account:

| Email | Password |
|---|---|
| `ensolvers@test.com` | `ensolvers-2026` |

The account already has a few notes and categories, and it is yours to edit, archive or delete anything. You can also press **Try the demo account** on the sign in screen, or create your own account with **Create an account**. Each account only sees its own notes.

> [!IMPORTANT]
> **The first sign in can take up to a minute.** The API runs on the free plan of Render, which turns the server off after 15 minutes without traffic. The first request after that wakes it up, so the button keeps loading for 30 to 60 seconds. This is the free hosting starting the server, not an error in the app. Once it is awake, everything responds right away.

### How it is hosted

The exercise repository is not mine, so I could not connect it to Vercel and Render: both deploy from a GitHub repository owned by the account. The live version runs from this repository, my personal copy of the same code.

| Part | Host | How it is set up |
|---|---|---|
| Web app | [Vercel](https://vercel.com), free plan | Builds `frontend/` with `VITE_API_URL` pointing to the API. Served at `nook.timosboy.lat`, a subdomain of my own domain |
| API | [Render](https://render.com), free plan | `render.yaml` (Blueprint) builds `backend/`, runs the migrations on every deploy, then starts the API. [Health check](https://nook-api-4z60.onrender.com/api/health) |
| Database | [Supabase](https://supabase.com) PostgreSQL, free plan | The API connects through the session pooler with SSL (`DB_SSL=true`) |

How it was deployed:

1. Created a Supabase project and copied its connection values (host, user, password).
2. In Render, created a Blueprint from the repository. It reads `render.yaml` and asks for the database user and password and the web app address; Render generates the `JWT_SECRET` itself.
3. In Vercel, imported the repository with `frontend` as the root directory and `VITE_API_URL` set to the Render URL plus `/api`.
4. Added `nook.timosboy.lat` in Vercel and its CNAME record in Cloudflare, my DNS provider, and set `FRONTEND_URL` in Render to that address so the API accepts its requests (CORS).

Every push to `main` deploys both apps again. The migrations create the tables, the demo account and the account above. Row level security is enabled on every table, so the Supabase public data API cannot read or write them; only the API, which connects as the table owner, can.

## Screenshots

| Sign in | Home |
|---|---|
| ![Sign in screen](docs/screenshots/login.png) | ![Home with recent notes](docs/screenshots/home.png) |

| Filter by category | Archived notes |
|---|---|
| ![Notes filtered by the Travel category](docs/screenshots/categories.png) | ![Archived notes](docs/screenshots/archived.png) |

| Block menu (type `/`) | Night theme |
|---|---|
| ![Slash menu in a note](docs/screenshots/slash.png) | ![Night theme](docs/screenshots/night.png) |

| Reading theme |
|---|
| ![Reading theme](docs/screenshots/reading.png) |

| Mobile sign in | Mobile list | Mobile editor |
|---|---|---|
| <img src="docs/screenshots/mobile-login.png" width="250" alt="Mobile sign in"> | <img src="docs/screenshots/mobile-list.png" width="250" alt="Mobile list"> | <img src="docs/screenshots/mobile-editor.png" width="250" alt="Mobile editor"> |

## Run it locally

From a fresh machine you only need **Node 22 or newer** and **Docker** running (versions in [Requirements](#requirements)). Then, from the root of the repository:

```bash
./run.sh
```

Open <http://localhost:5173> and sign in with either account. Locally both get the same sample notes. The API is at <http://localhost:3000/api>.

| Email | Password |
|---|---|
| `ensolvers@test.com` | `ensolvers-2026` |
| `demo@nook.app` | `nook-demo-2026` |

The script does this, in order, and stops with a clear message if something is missing:

1. Checks Node, npm and Docker, and that ports 3000, 5173 and 5433 are free.
2. Creates `backend/.env` and `frontend/.env` from the `.env.example` files.
3. Starts PostgreSQL in Docker and waits until it is healthy.
4. Installs the dependencies (`npm ci`) in both apps when they are missing or out of date.
5. Runs the database migrations.
6. Creates the two accounts above and loads a few sample notes for each, only if they have none.
7. Starts the API and the web app.

Press `Ctrl+C` to stop both apps. The database container keeps running; `./run.sh --down` stops it (the data is kept in a Docker volume).

| Option | What it does |
|---|---|
| `--no-seed` | Do not load the sample notes |
| `--lan` | Also open the app to your local network, to try it on a phone (see below) |
| `--down` | Stop the database container and exit |
| `--help` | Show the usage |

Logs are written to `.run/` (ignored by git).

### Try it on your phone

```bash
./run.sh --lan
```

The script prints a second address such as `http://192.168.1.20:5173`. Open it on a phone connected to the same Wi-Fi. The first time, macOS may ask whether Node can accept incoming connections: allow it. On the computer, open the printed address too (not `localhost`), so the browser and the API agree on the origin.

The API accepts several browser origins: `FRONTEND_URL` can hold a comma separated list.

### Without the script

```bash
docker compose up -d db
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm --prefix backend ci && npm --prefix frontend ci
npm --prefix backend run migration:run
npm --prefix backend run seed
npm --prefix backend run start:dev
npm --prefix frontend run dev
```

The last two commands run in separate terminals.

## Requirements

| Tool | Version used | Notes |
|---|---|---|
| Node.js | 22.23.2 | Minimum 22 (see `.nvmrc`) |
| npm | 10.9.8 | Comes with Node |
| Docker | 29.1.3 | Runs the database |
| Docker Compose | 2.40.3 | `docker compose` (v2) |
| PostgreSQL | 16.4 | Runs in Docker (`postgres:16.4-alpine`), nothing to install |
| Bash | 3.2 or newer | For `run.sh` |

Developed and tested on macOS (Apple silicon). `run.sh` only uses portable bash and standard tools, so it should work on Linux too, but it was not tested there.

### Main libraries

| Backend | Version | Frontend | Version |
|---|---|---|---|
| NestJS | 11.2.8 | React | 19.3.1 |
| TypeORM | 1.1.2 | Vite | 8.3.5 |
| `pg` | 8.23.1 | TypeScript | 7.0.2 |
| class-validator | 0.15.1 | Motion | 14.7.1 |
| class-transformer | 0.5.1 | Phosphor Icons | 2.1.10 |
| TypeScript | 5.9.3 | oxlint | 1.90.0 |
| Jest | 30.5.2 | TipTap | 3.32.1 |

## Features

**Phase 1**

- Create, edit and delete notes. Changes are saved automatically while you type.
- Archive and unarchive notes, with an Undo.
- List active notes and archived notes.

**Phase 2**

- Add and remove categories on a note.
- Filter the list by category.

**Extras**

- Login: create an account, or use one of the two sample accounts. Each user only sees their own notes, categories and images.
- Categories with their own color (a 10 color palette or any custom color), created and edited from the sidebar.
- Pin notes to the top of the list.
- Emoji icon for each note, with a searchable picker.
- Images inside the text of a note (JPEG, PNG, GIF, WebP, up to 5 MB each and 30 per note): paste, drag and drop onto the text, or use the insert button, and click one to see it full screen.
- Search, a live word count and reading time.
- An outline rail: when a note has three or more headings, a column of thin dashes sits in the left margin, outside the text, and shows its structure. It highlights the heading you are reading, opens a list of titles on hover, and jumps to a heading when you click it. It is hidden on narrow screens.
- A slash menu: type `/` in a note to insert a heading, list, checklist, quote, code block, divider or image, filtering as you type.
- A rich text editor with Markdown shortcuts: `1. ` and `- ` start a list, `[ ] ` a checklist, `# ` a heading, `> ` a quote, and `**bold**` or `_italic_` format as you type. Cmd/Ctrl+B and Cmd/Ctrl+I work, Tab indents list items. Notes are stored as Markdown text.
- Light, night and reading themes (the reading theme uses warm paper tones with no white).
- Hide the sidebar and the note list.
- Mobile layout with a formatting bar above the keyboard.

## Keyboard shortcuts

| Key | Action |
|---|---|
| `N` | New note |
| `/` | Search notes (outside the text of a note) |
| `/` inside a note | Open the block menu |
| `[` | Hide or show the sidebar |
| `]` | Hide or show the note list |
| `\` | Hide or show both |
| `Enter` on an empty list item | Leave the list |
| `Tab` / `Shift+Tab` | Indent or outdent list items |
| `Cmd/Ctrl+B`, `Cmd/Ctrl+I` | Bold and italic |
| `Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z` | Undo and redo |

Single key shortcuts are ignored while you type in a field.

## Architecture

The API follows the layered structure the exercise asks for. Each layer only talks to the next one:

```
HTTP request
   ↓
Controller      routes, ids and DTO validation (ValidationPipe)
   ↓
Service         business rules, throws HTTP exceptions
   ↓
Repository      the only code that touches TypeORM
   ↓
PostgreSQL
```

```
backend/src
├── notes/         controller, service, repository, entity, dto
├── categories/    controller, service, repository, entity, dto
├── images/        controller, service, repository, entity, image type detection
├── auth/          register, login, JWT guard, current user decorator
├── users/         user entity, repository, service, sample accounts
├── health/        health check for the host
├── common/        global error filter
├── config/        environment configuration
└── database/      data source, migrations, seed

frontend/src
├── auth/          sign in and sign up screen
├── workspace/     the three pane layout and the editor
├── notes/         types, API client, list hook
├── categories/    chips, picker, sidebar list, form
├── emoji/         emoji data and picker
├── components/    dialog and toast
└── lib/           http client, session, autosave, themes, panels, markdown helpers
```

### Decisions worth knowing

- **Login with a bearer token.** Passwords are hashed with bcrypt. Signing in returns a JWT (valid for 7 days) that the app sends as `Authorization: Bearer`. A global guard protects every route except register, login and health. Notes and categories belong to a user, and a note of another user answers 404, the same as a missing one. Images are fetched with the token too, so the browser shows them from memory instead of a public URL.
- **Migrations, not `synchronize`.** The schema only changes through the migrations in `backend/src/database/migrations`. `run.sh` applies them.
- **Validation.** Every request body goes through DTOs with `class-validator`, with `whitelist` and `forbidNonWhitelisted` on. Errors always look like `{ statusCode, message, path, timestamp }`.
- **Images live in PostgreSQL** (`bytea`), so everything persists in the database and `run.sh` needs no extra storage. The type is detected from the file content, not from what the browser says. In the note text an image is plain Markdown, `![name](/api/notes/<noteId>/images/<imageId>)`, and the editor resolves that path against the API address. Images that are no longer in the text are removed when you leave the note.
- **Pinning is not an edit.** Pinning a note keeps its `updatedAt`, and archiving a pinned note unpins it.
- **Category filter.** The API supports `GET /api/notes?categoryId=...`, which keeps all the categories of each note. The UI filters the notes it already has in memory, so it is instant and it works with Undo. Switching the UI to the server filter is a small change.
- **Category colors** are stored as `#rrggbb`. The chips derive their background and text from that color and the current theme, so any color works in every theme.
- **Notes are Markdown.** The `content` column holds plain Markdown text and the editor (TipTap) shows it formatted, so notes stay readable and portable, and old plain text notes are valid Markdown. Markdown has no underline, so there is none.
- **Autosave** waits 600 ms after you stop typing, and flushes a pending save when you leave the note.

## API

All routes are under `/api`. Ids are UUIDs. Every route except the first three needs `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| `POST` | `/auth/register` | Create an account (`name`, `email`, `password` of 8 or more characters), returns `{ token, user }` |
| `POST` | `/auth/login` | Sign in (`email`, `password`), returns `{ token, user }` |
| `GET` | `/health` | Health check |
| `GET` | `/auth/me` | The signed in user |
| `GET` | `/notes?archived=false&categoryId=` | List notes (pinned first, then latest) |
| `GET` | `/notes/:id` | Get a note |
| `POST` | `/notes` | Create a note (`title`, optional `content`, `emoji`) |
| `PATCH` | `/notes/:id` | Update `title`, `content` or `emoji` (`null` clears it) |
| `DELETE` | `/notes/:id` | Delete a note |
| `PATCH` | `/notes/:id/archive` | Archive (also unpins) |
| `PATCH` | `/notes/:id/unarchive` | Unarchive |
| `PATCH` | `/notes/:id/pin` | Pin (not allowed on archived notes) |
| `PATCH` | `/notes/:id/unpin` | Unpin |
| `PUT` | `/notes/:id/categories/:categoryId` | Add a category to a note |
| `DELETE` | `/notes/:id/categories/:categoryId` | Remove a category from a note |
| `GET` | `/categories` | List categories |
| `POST` | `/categories` | Create (`name`, optional hex `color`) |
| `PATCH` | `/categories/:id` | Rename or recolor |
| `DELETE` | `/categories/:id` | Delete (removed from every note) |
| `POST` | `/notes/:noteId/images` | Upload an image (`multipart/form-data`, field `file`) |
| `GET` | `/notes/:noteId/images/:imageId` | Get the image bytes |
| `DELETE` | `/notes/:noteId/images/:imageId` | Delete an image |

## Data model

| Table | Columns |
|---|---|
| `users` | `id`, `email` (unique, lowercase), `name`, `passwordHash` (bcrypt), `createdAt` |
| `notes` | `id`, `userId` (cascade), `title` (max 120), `content`, `emoji`, `archived`, `pinned`, `createdAt`, `updatedAt` |
| `categories` | `id`, `userId` (cascade), `name` (unique per user, case insensitive), `color` (`#rrggbb`), `createdAt` |
| `note_categories` | `noteId`, `categoryId` (many to many, deleted in cascade) |
| `note_images` | `id`, `noteId` (cascade), `filename`, `mimeType`, `size`, `data`, `createdAt` |

## Tests and checks

```bash
npm --prefix backend test           # 79 unit tests (services, auth, guard, DTOs, image detection)
npm --prefix backend run build
npm --prefix backend run lint       # ESLint (applies safe fixes)
npm --prefix frontend run build     # type check and bundle
npm --prefix frontend run lint
```

The frontend has no automated UI tests. It was checked by hand and with browser automation on desktop and on a phone sized screen.

## Troubleshooting

- **Port 5433 is in use.** The database listens on 5433 because a local PostgreSQL often uses 5432. Stop the program using it, or pick another port on a fresh checkout: `DB_PORT=5434 ./run.sh`. If `backend/.env` already exists, change `DB_PORT` there as well.
- **Docker is not running.** On macOS the script tries to open Docker Desktop. On Linux start the daemon first.
- **Node is too old.** Use Node 22 or newer. With nvm: `nvm install && nvm use`.
- **Start over with an empty database.** `docker compose down -v` removes the container and its data; then run `./run.sh` again.

## Credits

Made by Timothy Kuno.
