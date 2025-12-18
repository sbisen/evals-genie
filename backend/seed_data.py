"""
Seed script to populate demo data for Context sections
Run this script to add sample data to the database
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DATABASE_NAME = "evalsgenie"

async def seed_context_data():
    """Seed demo data for all context sections"""
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DATABASE_NAME]
    
    domain_id = "maps"
    
    print("🌱 Starting to seed demo data...")
    
    # 1. Agent I/O Samples
    print("\n📝 Seeding Agent I/O samples...")
    agent_io_collection = db["agent_io_samples"]
    
    agent_io_samples = [
        {
            "domain_id": domain_id,
            "input": '{"query": "What is the total revenue for Q4 2024?", "user_id": "analyst_001"}',
            "output": '{"revenue": 2500000, "currency": "USD", "quarter": "Q4", "year": 2024, "confidence": 0.98}'
        },
        {
            "domain_id": domain_id,
            "input": '{"query": "Show me the top 5 performing products", "filters": {"category": "electronics"}}',
            "output": '{"products": ["Laptop Pro", "Wireless Mouse", "USB-C Hub", "Monitor 27\\"", "Keyboard Mech"], "metric": "revenue", "period": "last_30_days"}'
        },
        {
            "domain_id": domain_id,
            "input": '{"query": "Generate a summary report for the sales team", "format": "pdf"}',
            "output": '{"report_id": "RPT-2024-001", "status": "generated", "download_url": "/reports/sales-summary-2024.pdf", "pages": 15}'
        }
    ]
    
    # Clear existing and insert new
    await agent_io_collection.delete_many({"domain_id": domain_id})
    if agent_io_samples:
        await agent_io_collection.insert_many(agent_io_samples)
    print(f"✅ Added {len(agent_io_samples)} Agent I/O samples")
    
    # 2. User Stories
    print("\n👥 Seeding User Stories...")
    user_stories_collection = db["user_stories"]
    
    user_stories = [
        {
            "domain_id": domain_id,
            "story": "As a Financial Analyst, I want to query quarterly revenue forecasts so that I can prepare accurate board presentations and strategic planning documents."
        },
        {
            "domain_id": domain_id,
            "story": "As a Data Scientist, I need to access historical sales data with flexible filtering options so that I can build predictive models for demand forecasting."
        },
        {
            "domain_id": domain_id,
            "story": "As a Marketing Manager, I want to see campaign performance metrics in real-time so that I can optimize ad spend and improve ROI."
        },
        {
            "domain_id": domain_id,
            "story": "As a Product Manager, I need to analyze user feedback and feature requests so that I can prioritize the product roadmap effectively."
        },
        {
            "domain_id": domain_id,
            "story": "As an Operations Manager, I want to monitor inventory levels and supply chain metrics so that I can prevent stockouts and optimize logistics."
        }
    ]
    
    await user_stories_collection.delete_many({"domain_id": domain_id})
    if user_stories:
        await user_stories_collection.insert_many(user_stories)
    print(f"✅ Added {len(user_stories)} User Stories")
    
    # 3. Prompts
    print("\n💬 Seeding Prompts...")
    prompts_collection = db["prompts"]
    
    prompts = [
        {
            "domain_id": domain_id,
            "key": "system-context",
            "type": "system",
            "content": "You are an AI assistant specialized in business intelligence and data analysis. Always provide accurate, data-driven insights based on the available information. If you're unsure about any data, clearly state your uncertainty."
        },
        {
            "domain_id": domain_id,
            "key": "query-enhancement",
            "type": "prompt",
            "content": "When analyzing queries, consider temporal context (last 12 months by default), apply relevant business rules, and format responses in a clear, actionable manner with key metrics highlighted."
        },
        {
            "domain_id": domain_id,
            "key": "error-handling",
            "type": "prompt",
            "content": "If a query cannot be answered due to missing data or insufficient permissions, provide a helpful explanation and suggest alternative approaches or data sources that might help."
        },
        {
            "domain_id": domain_id,
            "key": "data-validation",
            "type": "system",
            "content": "Always validate data quality before presenting results. Flag any anomalies, outliers, or data quality issues. Provide confidence scores when appropriate."
        }
    ]
    
    await prompts_collection.delete_many({"domain_id": domain_id})
    if prompts:
        await prompts_collection.insert_many(prompts)
    print(f"✅ Added {len(prompts)} Prompts")
    
    # 4. Training Examples (Sample Q&A)
    print("\n📚 Seeding Training Examples...")
    training_collection = db["training_examples"]
    
    training_examples = [
        {
            "domain_id": domain_id,
            "question": "What was the total revenue for the EMEA region in Q3 2024?",
            "golden_answer": "The total revenue for the EMEA region in Q3 2024 was $45.2 million, representing a 12% increase compared to Q3 2023."
        },
        {
            "domain_id": domain_id,
            "question": "Show me the top 10 customers by lifetime value",
            "golden_answer": "The top 10 customers by lifetime value are: 1) Acme Corp ($2.5M), 2) TechGlobal Inc ($2.1M), 3) DataSystems Ltd ($1.8M), 4) CloudFirst Solutions ($1.6M), 5) Enterprise Partners ($1.4M), 6) Digital Innovations ($1.3M), 7) Smart Analytics Co ($1.2M), 8) Future Tech Group ($1.1M), 9) Global Ventures ($980K), 10) Innovation Labs ($920K)."
        },
        {
            "domain_id": domain_id,
            "question": "What is the average order value for mobile app purchases vs website purchases?",
            "golden_answer": "The average order value for mobile app purchases is $127.50, while website purchases average $156.30. Website purchases have a 22.6% higher average order value compared to mobile app purchases."
        },
        {
            "domain_id": domain_id,
            "question": "How many new customers did we acquire last month compared to the same month last year?",
            "golden_answer": "Last month we acquired 1,247 new customers, which is a 18% increase compared to the same month last year when we acquired 1,056 new customers. This represents an additional 191 customers year-over-year."
        }
    ]
    
    await training_collection.delete_many({"domain_id": domain_id})
    if training_examples:
        await training_collection.insert_many(training_examples)
    print(f"✅ Added {len(training_examples)} Training Examples")
    
    # 5. Test Sets (with varied statuses - 82% pass rate for demo)
    print("\n🧪 Seeding Test Sets...")
    test_sets_collection = db["test_sets"]
    
    test_sets = [
        {
            "domain_id": domain_id,
            "question": "What is the year-over-year growth rate for Q4?",
            "ground_truth": "The year-over-year growth rate for Q4 is 15.3%, calculated by comparing Q4 2024 revenue of $52.8M against Q4 2023 revenue of $45.8M.",
            "difficulty": "medium",
            "last_status": "pass",
            "last_agent_answer": "Q4 YoY growth rate is 15.3% ($52.8M in 2024 vs $45.8M in 2023)",
            "last_evaluation_reasoning": "Correct calculation and clear presentation",
            "confidence_score": 95.8
        },
        {
            "domain_id": domain_id,
            "question": "List all active customers in the enterprise segment",
            "ground_truth": "There are 127 active enterprise customers: Acme Corp, TechGlobal Inc, DataSystems Ltd, CloudFirst Solutions, Enterprise Partners, and 122 others with active contracts and regular engagement.",
            "difficulty": "easy",
            "last_status": "pass",
            "last_agent_answer": "127 active enterprise customers including Acme Corp, TechGlobal Inc, DataSystems Ltd, and 124 others",
            "last_evaluation_reasoning": "Accurate count and representative examples provided",
            "confidence_score": 98.2
        },
        {
            "domain_id": domain_id,
            "question": "What is the customer lifetime value for cohorts acquired in 2023?",
            "ground_truth": "The average customer lifetime value for the 2023 cohort is $8,450, based on 1,247 customers generating $10.5M in total revenue over their lifecycle.",
            "difficulty": "hard",
            "last_status": "pass",
            "last_agent_answer": "2023 cohort CLV is $8,450 per customer (1,247 customers, $10.5M total revenue)",
            "last_evaluation_reasoning": "Correct CLV calculation with supporting data",
            "confidence_score": 92.5
        },
        {
            "domain_id": domain_id,
            "question": "Show the conversion funnel metrics for the checkout process",
            "ground_truth": "Checkout funnel conversion rates: Cart (100%) → Checkout Started (68%) → Payment Info (52%) → Order Confirmed (45%). Overall cart-to-purchase conversion is 45%.",
            "difficulty": "medium",
            "last_status": "warn",
            "last_agent_answer": "Funnel: Cart (100%) → Checkout (68%) → Payment (52%)",
            "last_evaluation_reasoning": "Missing final confirmation step and overall conversion rate",
            "confidence_score": 78.3
        },
        {
            "domain_id": domain_id,
            "question": "What is the average basket size by customer segment?",
            "ground_truth": "Average basket sizes by segment: Enterprise $2,340, SMB $890, Individual $156. Enterprise customers have 15x higher basket size than individual customers.",
            "difficulty": "easy",
            "last_status": "pass",
            "last_agent_answer": "Avg basket: Enterprise $2,340, SMB $890, Individual $156",
            "last_evaluation_reasoning": "Accurate segmentation and clear comparison",
            "confidence_score": 96.7
        },
        {
            "domain_id": domain_id,
            "question": "Calculate monthly recurring revenue for SaaS subscriptions",
            "ground_truth": "Current MRR is $847,500 from 3,450 active subscriptions with an average subscription value of $245.65 per month.",
            "difficulty": "medium",
            "last_status": "pass",
            "last_agent_answer": "MRR: $847,500 (3,450 active subs, avg $245.65/month)",
            "last_evaluation_reasoning": "Correct MRR with breakdown details",
            "confidence_score": 94.1
        },
        {
            "domain_id": domain_id,
            "question": "Identify customers at risk of churning based on engagement metrics",
            "ground_truth": "42 customers at high churn risk based on: no login in 30+ days (18 customers), declining feature usage (15 customers), multiple support tickets (9 customers). Recommended immediate outreach.",
            "difficulty": "hard",
            "last_status": "fail",
            "last_agent_answer": "18 customers haven't logged in for 30+ days",
            "last_evaluation_reasoning": "Incomplete - only checked login, missed feature usage and support ticket analysis",
            "confidence_score": 45.2
        },
        {
            "domain_id": domain_id,
            "question": "What is the average response time for customer support tickets?",
            "ground_truth": "Average support response time is 4.2 hours across all tickets. By priority: Critical 1.5hrs, High 3.8hrs, Medium 6.5hrs, Low 12.3hrs.",
            "difficulty": "easy",
            "last_status": "pass",
            "last_agent_answer": "Avg response: 4.2hrs overall (Critical 1.5hrs, High 3.8hrs, Medium 6.5hrs, Low 12.3hrs)",
            "last_evaluation_reasoning": "Complete breakdown with priority levels",
            "confidence_score": 97.4
        },
        {
            "domain_id": domain_id,
            "question": "Generate a sales forecast for next quarter based on historical trends",
            "ground_truth": "Q1 2025 forecast: $58.2M revenue (10% growth), based on 3-year trend analysis, seasonal patterns, and current pipeline of $42M. Confidence interval: $55.8M - $60.6M.",
            "difficulty": "hard",
            "last_status": "pass",
            "last_agent_answer": "Q1 2025 forecast: $58.2M (10% growth, $55.8M-$60.6M range)",
            "last_evaluation_reasoning": "Solid forecast with methodology and confidence interval",
            "confidence_score": 89.6
        },
        {
            "domain_id": domain_id,
            "question": "What percentage of users completed onboarding in the last 30 days?",
            "ground_truth": "In the last 30 days, 847 out of 1,120 new users completed onboarding, representing a 75.6% completion rate. This is 5.2% above our target of 70%.",
            "difficulty": "medium",
            "last_status": "fail",
            "last_agent_answer": "847 users completed onboarding out of 1,120 new users",
            "last_evaluation_reasoning": "Missing percentage calculation and time period context",
            "confidence_score": 52.9
        },
        {
            "domain_id": domain_id,
            "question": "Show top 5 products by profit margin",
            "ground_truth": "Top 5 by profit margin: 1) Premium Analytics ($450 cost, $1,200 price, 62.5% margin), 2) Enterprise Suite ($890/$2,100, 57.6%), 3) Pro Dashboard ($180/$400, 55%), 4) Data Connector ($95/$200, 52.5%), 5) API Access ($120/$250, 52%).",
            "difficulty": "easy",
            "last_status": "pass",
            "last_agent_answer": "Top 5 margins: Premium Analytics 62.5%, Enterprise Suite 57.6%, Pro Dashboard 55%, Data Connector 52.5%, API Access 52%",
            "last_evaluation_reasoning": "Accurate ranking with margin percentages",
            "confidence_score": 93.8
        }
    ]
    
    await test_sets_collection.delete_many({"domain_id": domain_id})
    if test_sets:
        await test_sets_collection.insert_many(test_sets)
    print(f"✅ Added {len(test_sets)} Test Sets")
    
    print("\n🎉 Demo data seeding completed successfully!")
    print(f"\nSummary:")
    print(f"  - Agent I/O Samples: {len(agent_io_samples)}")
    print(f"  - User Stories: {len(user_stories)}")
    print(f"  - Prompts: {len(prompts)}")
    print(f"  - Training Examples: {len(training_examples)}")
    print(f"  - Test Sets: {len(test_sets)}")
    print(f"\n✨ You can now view this data in the frontend!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_context_data())