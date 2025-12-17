# Demo Data Seeding Guide

## Overview
This guide explains how to populate your EvalsGenie database with demo data for all Context sections.

## What Gets Seeded

The seed script (`seed_data.py`) populates the following sections with realistic demo data:

### 1. **Agent I/O Samples** (3 samples)
- Example input/output pairs showing agent behavior
- JSON-formatted requests and responses
- Covers queries, filters, and report generation

### 2. **User Stories** (5 stories)
- Personas: Financial Analyst, Data Scientist, Marketing Manager, Product Manager, Operations Manager
- Real-world use cases and requirements
- Follows "As a [role], I want [goal] so that [benefit]" format

### 3. **Prompts** (4 prompts)
- System context prompts
- Query enhancement instructions
- Error handling guidelines
- Data validation rules

### 4. **Training Examples / Sample Q&A** (7 examples)
- Business intelligence questions
- SQL-related queries
- Covers revenue, customers, products, and support metrics
- Includes table references for each question

### 5. **Test Sets** (5 test cases)
- Evaluation questions with ground truth answers
- Mixed difficulty levels (easy, medium, hard)
- Pre-populated with pass/fail statuses for demo

## How to Run

### First Time Setup
```bash
cd server
python3 seed_data.py
```

### Re-seed (Clear and Repopulate)
The script automatically clears existing data for the "maps" domain before inserting new data:
```bash
cd server
python3 seed_data.py
```

## What You'll See

After running the script, you'll see output like:
```
🌱 Starting to seed demo data...

📝 Seeding Agent I/O samples...
✅ Added 3 Agent I/O samples

👥 Seeding User Stories...
✅ Added 5 User Stories

💬 Seeding Prompts...
✅ Added 4 Prompts

📚 Seeding Training Examples...
✅ Added 7 Training Examples

🧪 Seeding Test Sets...
✅ Added 5 Test Sets

🎉 Demo data seeding completed successfully!
```

## View the Data

Navigate to these pages in the frontend to see the seeded data:

1. **Agent I/O**: `/domain/maps/agent-io`
2. **User Stories**: `/domain/maps/user-stories`
3. **Prompts**: `/domain/maps/prompts`
4. **RAG Context**: `/domain/maps/rag-context` (no demo data - upload your own files)
5. **Sample Q&A**: `/domain/maps/training`
6. **Test Sets**: `/domain/maps/test-sets`

## Customizing the Data

To add your own demo data:

1. Open `server/seed_data.py`
2. Modify the data arrays for each section
3. Run the script again

Example:
```python
user_stories = [
    {
        "domain_id": domain_id,
        "story": "Your custom user story here..."
    },
    # Add more stories...
]
```

## Database Collections

The script populates these MongoDB collections:
- `agent_io_samples`
- `user_stories`
- `prompts`
- `training_examples`
- `test_sets`

## Notes

- The script uses the domain ID "maps" by default
- All existing data for this domain is cleared before seeding
- RAG Context (documents) is not seeded - upload files manually through the UI
- The script requires a valid MongoDB connection (check your `.env` file)

## Troubleshooting

**Connection Error:**
```
Make sure MONGODB_URI is set correctly in server/.env
```

**Permission Error:**
```
Ensure your MongoDB user has write permissions
```

**Script Not Found:**
```bash
# Make sure you're in the server directory
cd server
python3 seed_data.py