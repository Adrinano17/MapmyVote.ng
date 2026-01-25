# MapmyVote.ng - Ibadan North LGA

A location-based civic tech web application helping voters in Ibadan North LGA find and navigate to their assigned polling units using landmarks and GPS.

## Features

- 🌍 **Multi-language Support**: English, Yoruba, and Pidgin
- 📍 **Location Detection**: Automatic GPS-based user location
- 🗺️ **Ward Matching**: Find polling units by ward
- 🏛️ **Landmark Navigation**: Navigate using local landmarks (not just GPS)
- 🤖 **AI Guidance**: Natural language directions
- 🗺️ **Google Maps Integration**: Interactive maps with custom markers

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Maps**: Google Maps API

## Project Structure

```
MapmyVote.ng/
├── frontend/          # Next.js application
├── backend/           # Express API server
├── database/          # Database migrations and seeds
└── shared/            # Shared types and utilities
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Google Maps API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Set up environment variables (see `.env.example` files)

4. Run database migrations:
   ```bash
   cd backend && npm run migrate
   ```

5. Seed sample data:
   ```bash
   cd backend && npm run seed
   ```

6. Start development servers:
   ```bash
   # Terminal 1 - Frontend
   cd frontend && npm run dev

   # Terminal 2 - Backend
   cd backend && npm run dev
   ```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

### Backend (.env)
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/mapmyvote
GOOGLE_MAPS_API_KEY=your_key_here
NODE_ENV=development
```

## License

MIT





