# Task Manager – Lab 9 Warm-up

This repository contains a Lit-based task manager used for Lab 9. The project has been reorganized to follow a more conventional Vite layout with clear separation between source code, documentation, and tests.

## Getting Started

```bash
npm install
npm run dev
```

Additional commands:

- `npm run build` – generate the production bundle  
- `npm run preview` – preview the production build locally  
- `npm test` – run unit tests under `tests/unit`

## Project Structure

```text
.
├── docs/                # Lab handout and supporting documentation
│   └── lab-guide.md
├── src/                 # Application source code
│   ├── components/      # Web components that compose the UI
│   ├── models/          # Domain models and business logic
│   ├── services/        # Cross-cutting services (e.g., storage)
│   ├── styles/          # Global CSS for the application shell
│   └── main.js          # Vite entry point
├── tests/
│   └── unit/            # Node test suite for models/business logic
├── index.html           # Vite HTML entry point
├── package.json
├── vite.config.js
└── README.md
```

## Documentation

The original lab brief now lives at `docs/lab-guide.md`. Extend that directory with ADRs, additional notes, or generated documentation as you grow the project.
