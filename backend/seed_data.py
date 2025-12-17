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
            "type": "FEWSHOTS",
            "tables": ["SALES.REVENUE", "GEO.REGIONS"]
        },
        {
            "domain_id": domain_id,
            "question": "Show me the top 10 customers by lifetime value",
            "type": "FEWSHOTS",
            "tables": ["CUSTOMERS.PROFILES", "SALES.TRANSACTIONS"]
        },
        {
            "domain_id": domain_id,
            "question": "What is the average order value for mobile app purchases vs website purchases?",
            "type": "FEWSHOTS",
            "tables": ["SALES.ORDERS", "SALES.ORDER_ITEMS", "CHANNELS.SOURCES"]
        },
        {
            "domain_id": domain_id,
            "question": "How many new customers did we acquire last month compared to the same month last year?",
            "type": "FEWSHOTS",
            "tables": ["CUSTOMERS.PROFILES", "CUSTOMERS.ACQUISITION"]
        },
        {
            "domain_id": domain_id,
            "question": "What is the churn rate for enterprise customers in the last 6 months?",
            "type": "FEWSHOTS",
            "tables": ["CUSTOMERS.PROFILES", "CUSTOMERS.CHURN", "CUSTOMERS.SEGMENTS"]
        },
        {
            "domain_id": domain_id,
            "question": "Which product categories have the highest return rate?",
            "type": "FEWSHOTS",
            "tables": ["PRODUCTS.CATALOG", "SALES.RETURNS", "PRODUCTS.CATEGORIES"]
        },
        {
            "domain_id": domain_id,
            "question": "What is the average time to resolution for customer support tickets by priority level?",
            "type": "FEWSHOTS",
            "tables": ["SUPPORT.TICKETS", "SUPPORT.RESOLUTIONS"]
        }
    ]
    
    await training_collection.delete_many({"domain_id": domain_id})
    if training_examples:
        await training_collection.insert_many(training_examples)
    print(f"✅ Added {len(training_examples)} Training Examples")
    
    # 5. Test Sets
    print("\n🧪 Seeding Test Sets...")
    test_sets_collection = db["test_sets"]
    
    test_sets = [
        {
            "domain_id": domain_id,
            "question": "What is the year-over-year growth rate for Q4?",
            "ground_truth": "Calculate (Q4_2024_revenue - Q4_2023_revenue) / Q4_2023_revenue * 100",
            "difficulty": "medium",
            "last_status": "pass"
        },
        {
            "domain_id": domain_id,
            "question": "List all active customers in the enterprise segment",
            "ground_truth": "SELECT * FROM customers WHERE segment = 'enterprise' AND status = 'active'",
            "difficulty": "easy",
            "last_status": "pass"
        },
        {
            "domain_id": domain_id,
            "question": "What is the customer lifetime value for cohorts acquired in 2023?",
            "ground_truth": "Calculate total revenue per customer for 2023 cohort divided by number of customers",
            "difficulty": "hard",
            "last_status": "pass"
        },
        {
            "domain_id": domain_id,
            "question": "Show the conversion funnel metrics for the checkout process",
            "ground_truth": "Calculate conversion rates at each step: cart -> checkout -> payment -> confirmation",
            "difficulty": "medium",
            "last_status": "fail"
        },
        {
            "domain_id": domain_id,
            "question": "What is the average basket size by customer segment?",
            "ground_truth": "Calculate AVG(order_total) GROUP BY customer_segment",
            "difficulty": "easy",
            "last_status": "pass"
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