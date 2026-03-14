# Chem Hub: Feature Architecture

This document outlines the organization of the Network Hub feature, separated by frontend and backend responsibilities.

## 🎨 Frontend (React + Vite)
Located in `contributors/parvesh/frontend/src/`

- **Pages**
    - `pages/NetworkHub.jsx`: Main interface for real-time collaboration.
    - `pages/NetworkHub.css`: Styling for the hub, including private messaging UI.
- **Core**
    - `App.jsx`: Routes the `/network` path to the Network Hub.
- **Navigation**
    - `pages/Dashboard.jsx`: Link to the Network Hub.

## ⚙️ Backend (FastAPI + WebSocket)
Located in `contributors/parvesh/python_backend/`

- **Core Logic**
    - `main.py`: WebSocket server with group broadcasting and private recipient routing.
- **Persistence**
    - Supabase (PostgreSQL): Handles permanent storage of chat messages and user profiles.
- **Diagnostics**
    - `utils/debug_schema.py`: Verifies Supabase table health.
    - `utils/test_insert.py`: Validates database write permissions.

## 🛠️ Infrastructure
- **Vite Proxy**: Configured in `vite.config.js` to route `/api` calls to the FastAPI server on port 5000.
- **Networking**: Uses `127.0.0.1` (IPv4) for stable local WebSocket handshakes.
