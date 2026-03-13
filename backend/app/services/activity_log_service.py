from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from typing import List

def log_activity(db: Session, user_id: int, action: str, entity: str, entity_id: int):
    log = ActivityLog(user_id=user_id, action=action, entity=entity, entity_id=entity_id)
    db.add(log)
    db.commit()

def get_activities(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[ActivityLog]:
    return db.query(ActivityLog).filter(ActivityLog.user_id == user_id).order_by(ActivityLog.timestamp.desc()).offset(skip).limit(limit).all()