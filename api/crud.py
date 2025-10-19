from sqlalchemy.orm import Session

from . import models, schemas

def get_member(db: Session, member_id: int):
    return db.query(models.Member).filter(models.Member.member_id == member_id).first()

def get_member_by_external_id(db: Session, external_id: str):
    return db.query(models.Member).filter(models.Member.external_id == external_id).first()

def get_members(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Member).offset(skip).limit(limit).all()

def create_member(db: Session, member: schemas.MemberCreate):
    db_member = models.Member(**member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member
