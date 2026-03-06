from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.dashboard_schema import DashboardSummary
from app.models.user import User
from app.auth import get_db, get_current_user
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter()

@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_dashboard_summary(db, current_user.id)