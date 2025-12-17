from fastapi import APIRouter, HTTPException, status
from typing import List
from models import Domain, DomainUpdate
from database import get_collection

router = APIRouter()

# Get domains collection
def get_domains_collection():
    return get_collection("domains")


@router.get("/", response_model=List[Domain])
async def list_domains():
    """List all domains"""
    try:
        collection = get_domains_collection()
        domains = await collection.find().to_list(length=None)
        
        # Convert MongoDB _id to id field
        for domain in domains:
            if "_id" in domain:
                domain["id"] = domain.pop("_id")
        
        return domains
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch domains: {str(e)}"
        )


@router.post("/", response_model=Domain, status_code=status.HTTP_201_CREATED)
async def create_domain(domain: Domain):
    """Create a new domain"""
    try:
        collection = get_domains_collection()
        
        # Check if domain with this ID already exists
        existing = await collection.find_one({"_id": domain.id})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Domain with id '{domain.id}' already exists"
            )
        
        # Convert domain to dict and use id as _id
        domain_dict = domain.model_dump()
        domain_dict["_id"] = domain_dict.pop("id")
        
        await collection.insert_one(domain_dict)
        
        # Return the created domain
        return domain
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create domain: {str(e)}"
        )


@router.get("/{domain_id}", response_model=Domain)
async def get_domain(domain_id: str):
    """Get domain details by ID"""
    try:
        collection = get_domains_collection()
        domain = await collection.find_one({"_id": domain_id})
        
        if not domain:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Domain with id '{domain_id}' not found"
            )
        
        # Convert MongoDB _id to id field
        domain["id"] = domain.pop("_id")
        
        return domain
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch domain: {str(e)}"
        )


@router.put("/{domain_id}", response_model=Domain)
async def update_domain(domain_id: str, domain_update: DomainUpdate):
    """Update domain details"""
    try:
        collection = get_domains_collection()
        
        # Check if domain exists
        existing = await collection.find_one({"_id": domain_id})
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Domain with id '{domain_id}' not found"
            )
        
        # Get only the fields that were provided (exclude None values)
        update_data = domain_update.model_dump(exclude_unset=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Update the domain
        await collection.update_one(
            {"_id": domain_id},
            {"$set": update_data}
        )
        
        # Fetch and return the updated domain
        updated_domain = await collection.find_one({"_id": domain_id})
        updated_domain["id"] = updated_domain.pop("_id")
        
        return updated_domain
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update domain: {str(e)}"
        )