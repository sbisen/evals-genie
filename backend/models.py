from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class User(BaseModel):
    """User model for API responses"""
    id: str = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email address")
    is_active: bool = Field(default=True, description="Whether the user is active")
    created_at: Optional[datetime] = Field(default=None, description="User creation timestamp")


class UserCreate(BaseModel):
    """Model for user registration"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password (min 8 characters)")


class UserInDB(User):
    """User model as stored in database (includes hashed password)"""
    hashed_password: str = Field(..., description="Hashed password")


class Token(BaseModel):
    """JWT token response"""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")


class TokenData(BaseModel):
    """Data extracted from JWT token"""
    email: Optional[str] = Field(default=None, description="User email from token")


class Domain(BaseModel):
    """Domain model for API responses"""
    id: str = Field(..., description="Domain ID")
    alias: str = Field(..., description="Domain alias/display name")
    description: str = Field(..., description="Domain description")
    dialect: str = Field(..., description="SQL dialect (e.g., Snowflake, PostgreSQL)")
    secret: str = Field(..., description="Secret/credential identifier")
    schema_name: str = Field(..., description="Database schema name")
    retriever_top_k: int = Field(default=10, description="Number of top results for retriever")
    is_active: bool = Field(default=True, description="Whether the domain is active")


class DomainUpdate(BaseModel):
    """Model for updating domain details"""
    alias: Optional[str] = Field(default=None, description="Domain alias/display name")
    description: Optional[str] = Field(default=None, description="Domain description")
    dialect: Optional[str] = Field(default=None, description="SQL dialect")
    secret: Optional[str] = Field(default=None, description="Secret/credential identifier")
    schema_name: Optional[str] = Field(default=None, description="Database schema name")
    retriever_top_k: Optional[int] = Field(default=None, description="Number of top results for retriever")
    is_active: Optional[bool] = Field(default=None, description="Whether the domain is active")


# Context Assets Models

class AgentIOSample(BaseModel):
    """Agent I/O Sample model"""
    id: str = Field(..., description="Sample ID")
    domain_id: str = Field(..., description="Domain ID this sample belongs to")
    input: str = Field(..., description="Agent input (JSON string)")
    output: str = Field(..., description="Expected agent output (JSON string)")


class AgentIOSampleCreate(BaseModel):
    """Model for creating Agent I/O Sample"""
    input: str = Field(..., description="Agent input (JSON string)")
    output: str = Field(..., description="Expected agent output (JSON string)")


class UserStory(BaseModel):
    """User Story model"""
    id: str = Field(..., description="Story ID")
    domain_id: str = Field(..., description="Domain ID this story belongs to")
    story: str = Field(..., description="User story text")


class UserStoryCreate(BaseModel):
    """Model for creating User Story"""
    story: str = Field(..., description="User story text")


class Prompt(BaseModel):
    """Prompt model"""
    id: str = Field(..., description="Prompt ID")
    domain_id: str = Field(..., description="Domain ID this prompt belongs to")
    key: str = Field(..., description="Prompt key/identifier")
    type: str = Field(..., description="Prompt type")
    content: str = Field(..., description="Prompt content/text")


class PromptCreate(BaseModel):
    """Model for creating Prompt"""
    key: str = Field(..., description="Prompt key/identifier")
    type: str = Field(..., description="Prompt type")
    content: str = Field(..., description="Prompt content/text")


class PromptUpdate(BaseModel):
    """Model for updating Prompt"""
    key: Optional[str] = Field(default=None, description="Prompt key/identifier")
    type: Optional[str] = Field(default=None, description="Prompt type")
    content: Optional[str] = Field(default=None, description="Prompt content/text")


class TrainingExample(BaseModel):
    """Training Example model"""
    id: str = Field(..., description="Example ID")
    domain_id: str = Field(..., description="Domain ID this example belongs to")
    question: str = Field(..., description="Training question")
    type: str = Field(..., description="Question type")
    tables: list[str] = Field(..., description="List of table names")


class TrainingExampleCreate(BaseModel):
    """Model for creating Training Example"""
    question: str = Field(..., description="Training question")
    type: str = Field(..., description="Question type")
    tables: list[str] = Field(..., description="List of table names")


class RagDocument(BaseModel):
    """RAG Document model"""
    id: str = Field(..., description="Document ID")
    domain_id: str = Field(..., description="Domain ID this document belongs to")
    filename: str = Field(..., description="Original filename")
    size: int = Field(..., description="File size in bytes")
    uploaded_at: datetime = Field(..., description="Upload timestamp")


# Evaluation & Metrics Models

class TestSet(BaseModel):
    """Test Set model"""
    id: str = Field(..., description="Test set ID")
    domain_id: str = Field(..., description="Domain ID this test set belongs to")
    question: str = Field(..., description="Test question")
    ground_truth: str = Field(..., description="Expected ground truth answer")
    difficulty: str = Field(..., description="Difficulty level (easy, medium, hard)")
    last_status: Optional[str] = Field(default=None, description="Last evaluation status (pass, fail, warn)")


class TestSetCreate(BaseModel):
    """Model for creating Test Set"""
    question: str = Field(..., description="Test question")
    ground_truth: str = Field(..., description="Expected ground truth answer")
    difficulty: str = Field(..., description="Difficulty level (easy, medium, hard)")


class MetricBreakdown(BaseModel):
    """Metric breakdown by category"""
    category: str = Field(..., description="Metric category name")
    value: float = Field(..., description="Metric value")


class EvalMetrics(BaseModel):
    """Evaluation Metrics model for dashboard"""
    overall_score: float = Field(..., description="Overall evaluation score (0-100)")
    hallucination_rate: float = Field(..., description="Hallucination rate percentage")
    avg_latency: float = Field(..., description="Average latency in milliseconds")
    pass_rate: float = Field(..., description="Pass rate percentage")
    metric_breakdown: list[MetricBreakdown] = Field(..., description="Breakdown of metrics by category")