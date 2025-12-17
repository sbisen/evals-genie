from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid
import random

from database import get_collection
from models import (
    TestSet, TestSetCreate,
    EvalMetrics, MetricBreakdown
)
from auth import get_current_user

router = APIRouter()


# Test Sets Endpoints

@router.get("/domains/{domain_id}/test-sets", response_model=List[TestSet])
async def list_test_sets(domain_id: str, current_user: dict = Depends(get_current_user)):
    """List all test sets for a domain"""
    collection = get_collection("test_sets")
    test_sets = await collection.find({"domain_id": domain_id}).to_list(length=None)
    return [TestSet(
        id=str(ts["_id"]),
        domain_id=ts["domain_id"],
        question=ts["question"],
        ground_truth=ts["ground_truth"],
        difficulty=ts["difficulty"],
        last_status=ts.get("last_status")
    ) for ts in test_sets]


@router.post("/domains/{domain_id}/test-sets", response_model=TestSet)
async def create_test_set(
    domain_id: str,
    data: TestSetCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new test set"""
    collection = get_collection("test_sets")
    test_set_id = str(uuid.uuid4())
    
    test_set_doc = {
        "_id": test_set_id,
        "domain_id": domain_id,
        "question": data.question,
        "ground_truth": data.ground_truth,
        "difficulty": data.difficulty,
        "last_status": None
    }
    
    await collection.insert_one(test_set_doc)
    return TestSet(
        id=test_set_id,
        domain_id=domain_id,
        question=data.question,
        ground_truth=data.ground_truth,
        difficulty=data.difficulty,
        last_status=None
    )


@router.delete("/domains/{domain_id}/test-sets/{test_set_id}")
async def delete_test_set(
    domain_id: str,
    test_set_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a test set"""
    collection = get_collection("test_sets")
    result = await collection.delete_one({"_id": test_set_id, "domain_id": domain_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Test set not found")
    
    return {"message": "Test set deleted successfully"}


# Evaluation Run Endpoint

@router.post("/domains/{domain_id}/run-eval")
async def run_evaluation(
    domain_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Trigger a mock evaluation run.
    Iterates through all test sets for the domain and randomly updates their status.
    """
    collection = get_collection("test_sets")
    
    # Get all test sets for this domain
    test_sets = await collection.find({"domain_id": domain_id}).to_list(length=None)
    
    if not test_sets:
        raise HTTPException(status_code=400, detail="No test sets found for this domain")
    
    # Generate a unique run ID
    run_id = str(uuid.uuid4())
    
    # Randomly update status for each test set
    statuses = ["pass", "fail", "warn"]
    for test_set in test_sets:
        random_status = random.choice(statuses)
        await collection.update_one(
            {"_id": test_set["_id"]},
            {"$set": {"last_status": random_status}}
        )
    
    return {
        "status": "completed",
        "run_id": run_id,
        "test_sets_evaluated": len(test_sets)
    }


# Metrics Dashboard Endpoint

@router.get("/domains/{domain_id}/metrics", response_model=EvalMetrics)
async def get_metrics(
    domain_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get evaluation metrics for a domain.
    Calculates aggregations from test sets and returns mock data for other metrics.
    """
    collection = get_collection("test_sets")
    
    # Get all test sets for this domain
    test_sets = await collection.find({"domain_id": domain_id}).to_list(length=None)
    
    if not test_sets:
        # Return default metrics if no test sets exist
        return EvalMetrics(
            overall_score=0.0,
            hallucination_rate=0.0,
            avg_latency=0.0,
            pass_rate=0.0,
            metric_breakdown=[]
        )
    
    # Calculate pass rate
    total_tests = len(test_sets)
    passed_tests = sum(1 for ts in test_sets if ts.get("last_status") == "pass")
    pass_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0.0
    
    # Calculate metrics by difficulty
    difficulty_stats = {}
    for ts in test_sets:
        difficulty = ts.get("difficulty", "unknown")
        if difficulty not in difficulty_stats:
            difficulty_stats[difficulty] = {"total": 0, "passed": 0}
        difficulty_stats[difficulty]["total"] += 1
        if ts.get("last_status") == "pass":
            difficulty_stats[difficulty]["passed"] += 1
    
    # Create metric breakdown
    metric_breakdown = []
    for difficulty, stats in difficulty_stats.items():
        rate = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0.0
        metric_breakdown.append(MetricBreakdown(
            category=difficulty.capitalize(),
            value=round(rate, 2)
        ))
    
    # Generate mock metrics for other fields
    # Overall score is based on pass rate with some variation
    overall_score = round(pass_rate * random.uniform(0.9, 1.1), 2)
    overall_score = min(100.0, max(0.0, overall_score))  # Clamp between 0-100
    
    # Mock hallucination rate (inverse of pass rate with noise)
    hallucination_rate = round((100 - pass_rate) * random.uniform(0.3, 0.5), 2)
    
    # Mock average latency (200-800ms)
    avg_latency = round(random.uniform(200, 800), 2)
    
    return EvalMetrics(
        overall_score=overall_score,
        hallucination_rate=hallucination_rate,
        avg_latency=avg_latency,
        pass_rate=round(pass_rate, 2),
        metric_breakdown=metric_breakdown
    )