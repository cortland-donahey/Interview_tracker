# Interview tracker

A single-page app for tracking **job descriptions**, **candidates** (with pipeline status), and an **interview question bank**. Data is stored only in your browser (no server).

## Requirements

- [Node.js](https://nodejs.org/) 20+ (includes `npm`)

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Production build

```bash
npm run build
npm run preview
```

## Data storage

All jobs, candidates, and questions are saved automatically to **localStorage** under the key:

`interview-tracker:v1`

Clearing site data for this origin will remove your data. Use the same browser profile to keep it.

## Lint

```bash
npm run lint
```

## Tech stack

- Vue 3 (Composition API, `<script setup>`)
- TypeScript, Vite
- Vue Router, Pinia
- Tailwind CSS v4 (`@tailwindcss/vite`)
