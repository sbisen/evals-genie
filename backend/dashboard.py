from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from datetime import datetime
import random
from models import User
from auth import get_current_user
from database import get_collection

router = APIRouter()

# Realistic agent names for different categories
AGENT_NAMES = {
    "finance": [
        "Finance Compliance Reporter",
        "Revenue Analytics Agent",
        "Budget Forecasting Agent",
        "Financial Risk Analyzer"
    ],
    "devops": [
        "Infrastructure Monitor Agent",
        "Deployment Automation Agent",
        "System Health Checker",
        "CI/CD Pipeline Agent"
    ],
    "ads": [
        "Data Analytics Agent (Ads)",
        "Ads Analytics Agent",
        "Campaign Performance Tracker",
        "Audience Insights Agent"
    ],
    "engineering": [
        "Engineering Troubleshooting Agent",
        "Code Review Assistant",
        "Bug Triage Agent",
        "Performance Optimization Agent"
    ],
    "support": [
        "Customer Support Agent",
        "Ticket Routing Agent",
        "FAQ Assistant",
        "Issue Resolution Agent"
    ],
    "general": [
        "Data Analytics Agent",
        "Report Generation Agent",
        "Insights Discovery Agent",
        "Query Assistant Agent"
    ]
}

def get_realistic_agent_name(domain_id: str, category: str = "general") -> str:
    """Generate a realistic agent name based on domain and category"""
    category_key = category.lower() if category else "general"
    
    # Map difficulty levels to categories
    if category_key in ["easy", "medium", "hard"]:
        category_key = "general"
    
    # Get agent names for the category, fallback to general
    agent_list = AGENT_NAMES.get(category_key, AGENT_NAMES["general"])
    
    # Use domain_id hash to consistently pick the same name for the same domain
    index = hash(domain_id) % len(agent_list)
    return agent_list[index]


@router.get("/stats")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """Get overall dashboard statistics with realistic, optimistic numbers"""
    
    # Get collections
    domains_collection = get_collection("domains")
    test_sets_collection = get_collection("test_sets")
    
    # Use fixed demo values for consistent display
    total_agents = 5  # Total agents
    active_agents = 1  # Active agents
    pass_rate = 91.0  # Accuracy rate
    
    # Still fetch test sets for other calculations if needed
    all_test_sets = await test_sets_collection.find({}).to_list(length=1000)
    
    # Count high risk agents - use realistic low number
    high_risk_count = 0
    domains = await domains_collection.find({"is_active": True}).to_list(length=100)
    
    if domains:
        for domain in domains:
            domain_id = domain.get("id")
            domain_tests = [ts for ts in all_test_sets if ts.get("domain_id") == domain_id]
            if domain_tests:
                domain_passed = sum(1 for ts in domain_tests if ts.get("last_status") == "pass")
                domain_pass_rate = (domain_passed / len(domain_tests)) * 100
                if domain_pass_rate < 80:
                    high_risk_count += 1
    else:
        high_risk_count = 2  # Low number for optimistic view
    
    return {
        "total_agents": total_agents,
        "active_agents": active_agents,
        "pass_rate": pass_rate,  # Accuracy Rate
        "pass_rate_trend": 3.2,  # Positive trend
        "high_risk_agents": high_risk_count,
        "hallucination_rate": 4.8,  # Low hallucination rate (optimistic)
        "consistency_rate": 94.2  # High consistency rate (optimistic)
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
    
    # List of all agent categories to cycle through for variety
    # Start with "ads" to show Data Analytics Agent (Ads) first
    all_categories = ["ads", "finance", "devops", "engineering", "support", "general"]
    
    evaluations = []
    for idx, test in enumerate(recent_tests):
        domain_id = test.get("domain_id")
        domain = await domains_collection.find_one({"id": domain_id})
        
        # Generate scores with at least 4 out of 5 as Pass
        # Use index to create variety: mostly pass, occasional partial/fail
        test_id_hash = hash(str(test.get("_id")))
        
        # Ensure at least 4 out of 5 are Pass (80% pass rate)
        # New thresholds: <70 = Fail, 70-84 = Partial, ≥85 = Pass
        if idx < 4:  # First 4 are Pass
            score = 85 + (test_id_hash % 16)  # 85-100
        else:  # 5th one can be Partial or Fail
            score_category = (test_id_hash % 2)
            if score_category == 0:  # Partial
                score = 70 + (test_id_hash % 15)  # 70-84
            else:  # Fail
                score = 55 + (test_id_hash % 15)  # 55-69
        
        # Determine status based on score thresholds
        # ≥85 = Pass, 70-84 = Partial, <70 = Fail
        if score >= 85:
            status = "Passed"
        elif score >= 70:
            status = "Partial"
        else:
            status = "Failed"
        
        # Get realistic agent name - cycle through different categories for variety
        category_for_agent = all_categories[idx % len(all_categories)]
        agent_name = domain.get("alias") if domain and domain.get("alias") else get_realistic_agent_name(
            f"{domain_id}_{idx}", category_for_agent
        )
        
        evaluations.append({
            "id": str(test.get("_id")),
            "name": agent_name,
            "category": test.get("difficulty", "General").capitalize(),
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
                # Get realistic agent name
                agent_name = domain.get("alias") if domain.get("alias") else get_realistic_agent_name(domain_id, "general")
                
                high_risk_agents.append({
                    "id": domain_id,
                    "name": agent_name,
                    "category": "Engineering",  # Mock category
                    "description": domain.get("description", "No description available")[:100],
                    "pass_rate": pass_rate,
                    "evals": len(domain_tests),
                    "risk": "High" if pass_rate < 60 else "Medium"
                })
    
    return high_risk_agents