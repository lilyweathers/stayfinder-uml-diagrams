# StayFinder API

A small REST API built with Hono, Node.js, and TypeScript. Properties and
bookings are stored in JSON files for now; a later course step can replace this
data layer with Supabase/PostgreSQL.

## Requirements

- Node.js 20 or newer
- npm

## Run the project

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. To use another port, copy `.env.example` to
`.env` and change `HONO_PORT`.

### Windows: use Git Bash

If PowerShell blocks `npm.ps1` because of its execution policy, open the
project in Git Bash instead. The regular commands work there without changing
the PowerShell policy:

```bash
cd /c/ws/webb25/stayfinder-uml-diagrams
npm install
npm run dev
```

## Useful commands

```bash
npm run dev        # development server with automatic restart
npm test           # API integration tests (uses temporary JSON files)
npm run typecheck  # TypeScript check
npm run build      # compile to dist/
npm start          # run the compiled server
```

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | API status text |
| GET | `/properties` | List all properties |
| GET | `/properties/:id` | Get one property |
| POST | `/properties` | Create a property |
| PATCH | `/properties/:id` | Partially update a property |
| DELETE | `/properties/:id` | Delete a property |
| GET | `/bookings` | List all bookings |
| GET | `/bookings/:id` | Get one booking |
| POST | `/bookings` | Create a booking |
| PUT | `/bookings/:id` | Replace a booking |
| DELETE | `/bookings/:id` | Delete a booking |

POST and update request bodies are validated with Zod. A new booking receives
a generated `booking_id` and the status `pending` when those values are omitted.
The id in a PUT URL always wins, so a client cannot change a booking's id.

### Example: create a booking

```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": "property_1001",
    "guest_name": "Alex Andersson",
    "guest_email": "alex@example.com",
    "check_in": "2026-10-10",
    "check_out": "2026-10-12",
    "guests": 2
  }'
```

## How the types are used

- `NewBooking` describes incoming booking data. `booking_id` and `status` are
  optional because the backend can supply them.
- `Booking extends NewBooking` describes stored data, where both fields are
  required.
- `Partial<Property>` allows a PATCH request to update only selected fields.

## Supabase: the short version

Supabase is a backend platform built around PostgreSQL. It provides a hosted
relational database, authentication, file storage, realtime features, and a web
dashboard. In a later version, the functions in `src/lib/jsonDatabase.ts` can
be replaced with Supabase queries while the Hono routes and validation remain
largely the same. Do not add a Supabase key until the course asks for it, and
never commit a service-role key to Git.

## Preparation checklist

- [x] Hono runs in Node.js with TypeScript
- [x] Property data is stored in `src/data/properties.json`
- [x] Booking data is stored in `src/data/bookings.json`
- [x] Booking request bodies are validated with Zod
- [x] GET, POST, PUT/PATCH, and DELETE routes persist JSON changes
- [x] Supabase is summarized above for the next course step

## Publish to your own GitHub

Create an empty repository on GitHub, then run these commands from this folder:

```bash
git init
git add .
git commit -m "Set up StayFinder Hono API"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/stay-finder-be.git
git push -u origin main
```
