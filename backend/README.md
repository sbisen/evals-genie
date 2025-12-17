# EvalsGenie Backend Server

FastAPI backend for the EvalsGenie AI Agent Evaluation Platform.

## Setup

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   - Copy `.env` and update `MONGODB_URI` with your MongoDB connection string
   - Default: `mongodb://localhost:27017`

## Running the Server

### Development Mode
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
python main.py
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Available Endpoints

### Health Check
- `GET /healthz` - Returns server health status

### Root
- `GET /` - Returns API information

## Project Structure

```
server/
├── main.py           # FastAPI application and routes
├── database.py       # MongoDB connection and helpers
├── requirements.txt  # Python dependencies
├── .env             # Environment variables (not in git)
└── README.md        # This file
```

## MongoDB Setup

### Local MongoDB
Install MongoDB locally or use Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### MongoDB Atlas (Cloud)
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string
3. Update `MONGODB_URI` in `.env`

## Next Steps

Future sprints will add:
- Domain management endpoints
- Test set CRUD operations
- Prompt management
- Metrics tracking
- Schema validation
- RAG context management