from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.schemas.activity_log_schema import ActivityLogResponse
from app.models.user import User
from app.auth import get_db, get_current_user
from app.services.activity_log_service import get_activities

router = APIRouter()

@router.get("/", response_model=List[ActivityLogResponse])
def get_activities_endpoint(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_activities(db, current_user.id, skip, limit)
