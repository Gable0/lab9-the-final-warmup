# Task Manager – Lab 9 Warm-up
## Netlify Link: https://gable0comp305lab9.netlify.app/

This repository contains a Lit-based task manager used for Lab 9. The project has been reorganized to follow a more conventional Vite layout with clear separation between source code, documentation, and tests.

## Getting Started

```bash
npm install
npm run dev
```

Additional commands:

- `npm run build` – generate the production bundle
- `npm run preview` – preview the production build locally
- `npm run lint` – lint source and script files
- `npm run test:unit` – execute Node-based unit tests
- `npm run test:e2e` – run Playwright browser tests against a dev server
- `npm run test:all` – run both unit and E2E suites
- `npm run docs:generate` – produce API documentation from JSDoc comments

## Deployment

The automated GitHub Actions pipeline builds and publishes the `dist/` output to GitHub Pages on every push to `main`. Once the action completes, the live app is available here:

- https://gablekrich.github.io/lab9-the-final-warmup/

If you fork this repository, update the link above to match your GitHub username.

## Project Structure

```text
.
├── docs/                # Lab handout and supporting documentation
│   ├── adrs/            # Architectural decision records
│   ├── api.md           # Generated API reference
│   └── lab-guide.md
├── scripts/             # Project maintenance scripts (docs generation, etc.)
├── src/                 # Application source code
│   ├── components/      # Web components that compose the UI
│   ├── models/          # Domain models and business logic
│   ├── services/        # Cross-cutting services (e.g., storage)
│   ├── styles/          # Global CSS for the application shell
│   └── main.js          # Vite entry point
├── tests/
│   ├── e2e/             # Playwright scenarios exercising the UI
│   └── unit/            # Node test suite for models/business logic
├── index.html           # Vite HTML entry point
├── package.json
├── vite.config.js
└── README.md
```

## Project Tracking

- Issues: https://github.com/gablekrich/lab9-the-final-warmup/issues
- Activity Log: `git log --oneline --decorate --graph`

## Continuous Integration

The workflow defined in `.github/workflows/pipeline.yml` runs on every push and pull request:

- Installs dependencies with `npm ci`
- Executes linting, documentation generation, unit tests, and Playwright E2E tests
- Builds the production bundle and, on pushes to `main`, deploys `dist/` to GitHub Pages

## Documentation

- `docs/lab-guide.md` – the original lab brief
- `docs/adrs` – architecture decision records; see `lit-decision.md`
- `docs/api.md` – generated API reference derived from JSDoc across `src/`

Regenerate the API reference any time you update component JSDoc by running `npm run docs:generate`.
