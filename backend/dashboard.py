from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import datetime
from models import User
from auth import get_current_user
from database import get_collection

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """Get overall dashboard statistics"""
    
    # Get collections
    domains_collection = get_collection("domains")
    test_sets_collection = get_collection("test_sets")
    
    # Count total domains (agents)
    total_agents = await domains_collection.count_documents({"is_active": {"$exists": True}})
    
    # Count active domains
    active_agents = await domains_collection.count_documents({"is_active": True})
    
    # Calculate pass rate from test sets
    all_test_sets = await test_sets_collection.find({}).to_list(length=1000)
    
    if all_test_sets:
        passed = sum(1 for ts in all_test_sets if ts.get("last_status") == "pass")
        total = len(all_test_sets)
        pass_rate = round((passed / total) * 100, 1) if total > 0 else 0
    else:
        pass_rate = 0
    
    # Count high risk agents (domains with pass rate < 80%)
    high_risk_count = 0
    domains = await domains_collection.find({"is_active": True}).to_list(length=100)
    
    for domain in domains:
        domain_id = domain.get("id")
        domain_tests = [ts for ts in all_test_sets if ts.get("domain_id") == domain_id]
        if domain_tests:
            domain_passed = sum(1 for ts in domain_tests if ts.get("last_status") == "pass")
            domain_pass_rate = (domain_passed / len(domain_tests)) * 100
            if domain_pass_rate < 80:
                high_risk_count += 1
    
    return {
        "total_agents": total_agents,
        "active_agents": active_agents,
        "pass_rate": pass_rate,
        "pass_rate_trend": 2.3,  # Mock trend for now
        "high_risk_agents": high_risk_count
    }


@router.get("/recent-evaluations")
async def get_recent_evaluations(
    limit: int = 10,
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get recent evaluation runs"""
    
    test_sets_collection = get_collection("test_sets")
    domains_collection = get_collection("domains")
    
    # Get recent test sets (mock evaluation runs)
    recent_tests = await test_sets_collection.find({}).sort("_id", -1).limit(limit).to_list(length=limit)
    
    evaluations = []
    for test in recent_tests:
        domain_id = test.get("domain_id")
        domain = await domains_collection.find_one({"id": domain_id})
        
        # Calculate a mock score based on status
        if test.get("last_status") == "pass":
            score = 85 + (hash(str(test.get("_id"))) % 15)  # 85-100
            status = "Passed"
        elif test.get("last_status") == "fail":
            score = 50 + (hash(str(test.get("_id"))) % 30)  # 50-80
            status = "Failed"
        else:
            score = 70 + (hash(str(test.get("_id"))) % 20)  # 70-90
            status = "Partial"
        
        evaluations.append({
            "id": str(test.get("_id")),
            "name": domain.get("alias", "Unknown Agent") if domain else "Unknown Agent",
            "category": test.get("difficulty", "General"),
            "date": datetime.utcnow().strftime("%m/%d/%Y, %I:%M:%S %p"),
            "score": score,
            "status": status
        })
    
    return evaluations


@router.get("/high-risk-agents")
async def get_high_risk_agents(
    current_user: User = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """Get list of high-risk agents (domains with low pass rates)"""
    
    domains_collection = get_collection("domains")
    test_sets_collection = get_collection("test_sets")
    
    domains = await domains_collection.find({"is_active": True}).to_list(length=100)
    all_test_sets = await test_sets_collection.find({}).to_list(length=1000)
    
    high_risk_agents = []
    
    for domain in domains:
        domain_id = domain.get("id")
        domain_tests = [ts for ts in all_test_sets if ts.get("domain_id") == domain_id]
        
        if domain_tests:
            passed = sum(1 for ts in domain_tests if ts.get("last_status") == "pass")
            pass_rate = round((passed / len(domain_tests)) * 100, 1)
            
            # Consider high risk if pass rate < 80%
            if pass_rate < 80:
                high_risk_agents.append({
                    "id": domain_id,
                    "name": domain.get("alias", domain_id),
                    "category": "Engineering",  # Mock category
                    "description": domain.get("description", "No description available")[:100],
                    "pass_rate": pass_rate,
                    "evals": len(domain_tests),
                    "risk": "High" if pass_rate < 60 else "Medium"
                })
    
    return high_risk_agents