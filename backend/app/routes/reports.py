from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.auth import get_db, get_current_user
from app.models.user import User
from app.schemas.report_schema import SalesReportResponse, StockReportResponse, TopProductResponse
from app.services.report_service import get_sales_report, get_stock_report, get_top_products

router = APIRouter()

@router.get("/sales", response_model=SalesReportResponse)
def sales_report(
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_sales_report(db, current_user.id, start_date, end_date)

@router.get("/stock", response_model=StockReportResponse)
def stock_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_stock_report(db, current_user.id)

@router.get("/top-products", response_model=List[TopProductResponse])
def top_products_report(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_top_products(db, current_user.id, limit)
