from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List
import uuid
import os
from datetime import datetime
import shutil

from database import get_collection
from models import RagDocument
from auth import get_current_user

router = APIRouter()

# Base upload directory
UPLOAD_BASE_DIR = "uploads"


@router.get("/domains/{domain_id}/documents", response_model=List[RagDocument])
async def list_documents(domain_id: str, current_user: dict = Depends(get_current_user)):
    """List all RAG documents for a domain"""
    collection = get_collection("rag_documents")
    documents = await collection.find({"domain_id": domain_id}).to_list(length=None)
    return [RagDocument(
        id=str(d["_id"]),
        domain_id=d["domain_id"],
        filename=d["filename"],
        size=d["size"],
        uploaded_at=d["uploaded_at"]
    ) for d in documents]


@router.post("/domains/{domain_id}/documents", response_model=RagDocument)
async def upload_document(
    domain_id: str,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload a new RAG document"""
    collection = get_collection("rag_documents")
    doc_id = str(uuid.uuid4())
    
    # Create domain-specific upload directory
    domain_upload_dir = os.path.join(UPLOAD_BASE_DIR, domain_id)
    os.makedirs(domain_upload_dir, exist_ok=True)
    
    # Save file to disk
    file_path = os.path.join(domain_upload_dir, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Save metadata to MongoDB
        uploaded_at = datetime.utcnow()
        doc_metadata = {
            "_id": doc_id,
            "domain_id": domain_id,
            "filename": file.filename,
            "size": file_size,
            "uploaded_at": uploaded_at
        }
        
        await collection.insert_one(doc_metadata)
        
        return RagDocument(
            id=doc_id,
            domain_id=domain_id,
            filename=file.filename,
            size=file_size,
            uploaded_at=uploaded_at
        )
    except Exception as e:
        # Clean up file if database insert fails
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")


@router.delete("/domains/{domain_id}/documents/{doc_id}")
async def delete_document(
    domain_id: str,
    doc_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a RAG document"""
    collection = get_collection("rag_documents")
    
    # Find document metadata
    doc = await collection.find_one({"_id": doc_id, "domain_id": domain_id})
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from disk
    file_path = os.path.join(UPLOAD_BASE_DIR, domain_id, doc["filename"])
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Warning: Failed to delete file {file_path}: {e}")
    
    # Delete metadata from database
    result = await collection.delete_one({"_id": doc_id, "domain_id": domain_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"message": "Document deleted successfully"}