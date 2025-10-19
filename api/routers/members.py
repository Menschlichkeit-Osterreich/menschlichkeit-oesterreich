from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, models, schemas
from ..database import SessionLocal

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/members/", response_model=List[schemas.Member])
def read_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    members = crud.get_members(db, skip=skip, limit=limit)
    return members


@router.get("/members/{member_id}", response_model=schemas.Member)
def read_member(member_id: int, db: Session = Depends(get_db)):
    db_member = crud.get_member(db, member_id=member_id)
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return db_member


@router.post("/members/", response_model=schemas.Member)
def create_member(member: schemas.MemberCreate, db: Session = Depends(get_db)):
    db_member = crud.get_member_by_external_id(db, external_id=member.external_id)
    if db_member:
        raise HTTPException(status_code=400, detail="External ID already registered")
    return crud.create_member(db=db, member=member)
