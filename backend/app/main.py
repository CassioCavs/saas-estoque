from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.routes.products import router as products_router
from app.routes.categories import router as categories_router
from app.routes.customers import router as customers_router
from app.routes.stock import router as stock_router
from app.routes.dashboard import router as dashboard_router
from app.routes.alerts import router as alerts_router
from app.routes.sales import router as sales_router
from app.routes.reports import router as reports_router
from app.routes.activity_log import router as history_router
from app.models.product import Product
from app.models.category import Category
from app.models.customer import Customer
from app.models.sale import Sale, SaleItem
from app.models.stock_movement import StockMovement
from app.database import engine, Base
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(products_router, prefix="/products", tags=["products"])
app.include_router(categories_router, prefix="/categories", tags=["categories"])
app.include_router(customers_router, prefix="/customers", tags=["customers"])
app.include_router(stock_router, prefix="/stock", tags=["stock"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
app.include_router(alerts_router, prefix="/alerts", tags=["alerts"])
app.include_router(sales_router, prefix="/sales", tags=["sales"])
app.include_router(reports_router, prefix="/reports", tags=["reports"])
app.include_router(history_router, prefix="/history", tags=["history"])

@app.get("/")
def root():
    return {"message": "SaaS Estoque API"}