from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid

from database import get_collection
from models import (
    AgentIOSample, AgentIOSampleCreate,
    UserStory, UserStoryCreate,
    Prompt, PromptCreate, PromptUpdate,
    TrainingExample, TrainingExampleCreate
)
from auth import get_current_user

router = APIRouter()


# Agent I/O Endpoints

@router.get("/domains/{domain_id}/agent-io", response_model=List[AgentIOSample])
async def list_agent_io(domain_id: str, current_user: dict = Depends(get_current_user)):
    """List all Agent I/O samples for a domain"""
    collection = get_collection("agent_io")
    samples = await collection.find({"domain_id": domain_id}).to_list(length=None)
    return [AgentIOSample(id=str(s["_id"]), domain_id=s["domain_id"], 
                          input=s["input"], output=s["output"]) for s in samples]


@router.post("/domains/{domain_id}/agent-io", response_model=AgentIOSample)
async def create_agent_io(
    domain_id: str, 
    data: AgentIOSampleCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new Agent I/O sample"""
    collection = get_collection("agent_io")
    sample_id = str(uuid.uuid4())
    
    sample_doc = {
        "_id": sample_id,
        "domain_id": domain_id,
        "input": data.input,
        "output": data.output
    }
    
    await collection.insert_one(sample_doc)
    return AgentIOSample(id=sample_id, domain_id=domain_id, 
                        input=data.input, output=data.output)


@router.delete("/domains/{domain_id}/agent-io/{sample_id}")
async def delete_agent_io(
    domain_id: str, 
    sample_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an Agent I/O sample"""
    collection = get_collection("agent_io")
    result = await collection.delete_one({"_id": sample_id, "domain_id": domain_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Agent I/O sample not found")
    
    return {"message": "Agent I/O sample deleted successfully"}


# User Stories Endpoints

@router.get("/domains/{domain_id}/user-stories", response_model=List[UserStory])
async def list_user_stories(domain_id: str, current_user: dict = Depends(get_current_user)):
    """List all user stories for a domain"""
    collection = get_collection("user_stories")
    stories = await collection.find({"domain_id": domain_id}).to_list(length=None)
    return [UserStory(id=str(s["_id"]), domain_id=s["domain_id"], 
                     story=s["story"]) for s in stories]


@router.post("/domains/{domain_id}/user-stories", response_model=UserStory)
async def create_user_story(
    domain_id: str,
    data: UserStoryCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new user story"""
    collection = get_collection("user_stories")
    story_id = str(uuid.uuid4())
    
    story_doc = {
        "_id": story_id,
        "domain_id": domain_id,
        "story": data.story
    }
    
    await collection.insert_one(story_doc)
    return UserStory(id=story_id, domain_id=domain_id, story=data.story)


@router.delete("/domains/{domain_id}/user-stories/{story_id}")
async def delete_user_story(
    domain_id: str,
    story_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a user story"""
    collection = get_collection("user_stories")
    result = await collection.delete_one({"_id": story_id, "domain_id": domain_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User story not found")
    
    return {"message": "User story deleted successfully"}


# Prompts Endpoints

@router.get("/domains/{domain_id}/prompts", response_model=List[Prompt])
async def list_prompts(domain_id: str, current_user: dict = Depends(get_current_user)):
    """List all prompts for a domain"""
    collection = get_collection("prompts")
    prompts = await collection.find({"domain_id": domain_id}).to_list(length=None)
    return [Prompt(id=str(p["_id"]), domain_id=p["domain_id"],
                  key=p["key"], type=p["type"], content=p["content"]) for p in prompts]


@router.post("/domains/{domain_id}/prompts", response_model=Prompt)
async def create_prompt(
    domain_id: str,
    data: PromptCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new prompt"""
    collection = get_collection("prompts")
    prompt_id = str(uuid.uuid4())
    
    prompt_doc = {
        "_id": prompt_id,
        "domain_id": domain_id,
        "key": data.key,
        "type": data.type,
        "content": data.content
    }
    
    await collection.insert_one(prompt_doc)
    return Prompt(id=prompt_id, domain_id=domain_id, 
                 key=data.key, type=data.type, content=data.content)


@router.put("/domains/{domain_id}/prompts/{prompt_id}", response_model=Prompt)
async def update_prompt(
    domain_id: str,
    prompt_id: str,
    data: PromptUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a prompt"""
    collection = get_collection("prompts")
    
    # Build update document
    update_doc = {}
    if data.key is not None:
        update_doc["key"] = data.key
    if data.type is not None:
        update_doc["type"] = data.type
    if data.content is not None:
        update_doc["content"] = data.content
    
    if not update_doc:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await collection.find_one_and_update(
        {"_id": prompt_id, "domain_id": domain_id},
        {"$set": update_doc},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return Prompt(id=str(result["_id"]), domain_id=result["domain_id"],
                 key=result["key"], type=result["type"], content=result["content"])


@router.delete("/domains/{domain_id}/prompts/{prompt_id}")
async def delete_prompt(
    domain_id: str,
    prompt_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a prompt"""
    collection = get_collection("prompts")
    result = await collection.delete_one({"_id": prompt_id, "domain_id": domain_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return {"message": "Prompt deleted successfully"}


# Training Examples Endpoints

@router.get("/domains/{domain_id}/training-examples", response_model=List[TrainingExample])
async def list_training_examples(domain_id: str, current_user: dict = Depends(get_current_user)):
    """List all training examples for a domain"""
    collection = get_collection("training_examples")
    examples = await collection.find({"domain_id": domain_id}).to_list(length=None)
    return [TrainingExample(
        id=str(e["_id"]),
        domain_id=e["domain_id"],
        question=e["question"],
        golden_answer=e.get("golden_answer", ""),
        type=e.get("type"),
        tables=e.get("tables")
    ) for e in examples]


@router.post("/domains/{domain_id}/training-examples", response_model=TrainingExample)
async def create_training_example(
    domain_id: str,
    data: TrainingExampleCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new training example"""
    collection = get_collection("training_examples")
    example_id = str(uuid.uuid4())
    
    example_doc = {
        "_id": example_id,
        "domain_id": domain_id,
        "question": data.question,
        "golden_answer": data.golden_answer,
        "type": data.type,
        "tables": data.tables
    }
    
    await collection.insert_one(example_doc)
    return TrainingExample(
        id=example_id,
        domain_id=domain_id,
        question=data.question,
        golden_answer=data.golden_answer,
        type=data.type,
        tables=data.tables
    )


@router.delete("/domains/{domain_id}/training-examples/{example_id}")
async def delete_training_example(
    domain_id: str,
    example_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a training example"""
    collection = get_collection("training_examples")
    result = await collection.delete_one({"_id": example_id, "domain_id": domain_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Training example not found")
    
    return {"message": "Training example deleted successfully"}