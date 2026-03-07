from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr | None = None
    phone: str | None = None

class CustomerUpdate(BaseModel):
    name: str | None = Field(None, min_length=1)
    email: EmailStr | None = None
    phone: str | None = None

class CustomerResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: str | None
    phone: str | None
    created_at: datetime

    class Config:
        from_attributes = True
