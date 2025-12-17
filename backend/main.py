from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import connect_to_mongo, close_mongo_connection, get_collection
from auth import router as auth_router
from domains import router as domains_router
from context import router as context_router
from documents import router as documents_router
from evaluation import router as evaluation_router
from dashboard import router as dashboard_router
from models import Domain

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="EvalsGenie API",
    description="Backend API for EvalsGenie - AI Agent Evaluation Platform",
    version="1.0.0"
)

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize database connection on startup"""
    await connect_to_mongo()
    
    # Seed default domain if collection is empty
    try:
        domains_collection = get_collection("domains")
        count = await domains_collection.count_documents({})
        
        if count == 0:
            print("Seeding default 'maps' domain...")
            default_domain = {
                "_id": "maps",
                "alias": "Advertising Insights",
                "description": "Commercial Aviation Mobility Advertising Platform Services",
                "dialect": "Snowflake",
                "secret": "snowflake",
                "schema_name": "maps.derived",
                "retriever_top_k": 10,
                "is_active": True
            }
            await domains_collection.insert_one(default_domain)
            print("✓ Default domain 'maps' created successfully")
    except Exception as e:
        print(f"Warning: Failed to seed default domain: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    await close_mongo_connection()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(domains_router, prefix="/api/v1/domains", tags=["Domains"])
app.include_router(context_router, prefix="/api/v1", tags=["Context Assets"])
app.include_router(documents_router, prefix="/api/v1", tags=["RAG Documents"])
app.include_router(evaluation_router, prefix="/api/v1", tags=["Evaluation & Metrics"])
app.include_router(dashboard_router, prefix="/api/v1/dashboard", tags=["Dashboard"])

@app.get("/healthz")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to EvalsGenie API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)