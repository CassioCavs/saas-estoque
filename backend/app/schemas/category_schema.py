from pydantic import BaseModel, Field
from datetime import datetime

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1)

class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=1)

class CategoryResponse(BaseModel):
    id: int
    name: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
