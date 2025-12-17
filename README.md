# EvalsGenie - AI Agent Evaluation Platform

Domain-aware, no-code AI evaluation platform that empowers enterprise teams to validate AI agents.

## Project Structure

```
EvalsGenieUI/
├── frontend/           # React + TypeScript + Vite frontend
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
│
├── backend/           # Python FastAPI backend
│   ├── main.py        # FastAPI application
│   ├── models.py      # Data models
│   ├── database.py    # MongoDB connection
│   └── requirements.txt # Python dependencies
│
└── README.md          # This file
```

## Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or Atlas)

### 1. Setup Backend

```bash
cd backend

# Create virtual environment (optional but recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env and update MONGODB_URI if needed

# Run backend server
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

### 2. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev
```

Frontend will be available at: http://localhost:5000

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui

### Backend
- Python 3.8+
- FastAPI
- MongoDB (Motor)
- Pydantic
- JWT Authentication

## Features

- **Domain Management** - Organize evaluations by business domains
- **Test Sets** - Create and manage test cases
- **Prompt Management** - Version control for prompts
- **Metrics Tracking** - Monitor AI agent performance
- **Schema Validation** - Ensure data consistency
- **RAG Context** - Manage retrieval-augmented generation contexts
- **User Stories** - Track requirements and use cases
- **Training Data** - Manage training datasets

## Development

### Backend Development
See [backend/README.md](backend/README.md) for detailed backend setup and API documentation.

### Frontend Development
See [frontend/README.md](frontend/README.md) for detailed frontend setup and component documentation.

## License

MIT