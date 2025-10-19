from sqlalchemy import Boolean, Column, Integer, String, Date, TIMESTAMP, ForeignKey, Text
from sqlalchemy.orm import relationship

from .database import Base

class Member(Base):
    __tablename__ = "members"

    member_id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True)
    status = Column(String)
    joined_at = Column(Date)
    cancelled_at = Column(Date)
    fee_plan = Column(String)
    consent_dsgvo = Column(Boolean)
    consent_ts = Column(TIMESTAMP)

    payments = relationship("Payment", back_populates="member")

class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)
    source = Column(String)
    external_id = Column(String, unique=True, index=True)
    payer_type = Column(String)
    member_id = Column(Integer, ForeignKey("members.member_id"))
    amount_cents = Column(Integer)
    currency = Column(String)
    method = Column(String)
    is_recurring = Column(Boolean)
    booked_at = Column(TIMESTAMP)
    campaign = Column(String)

    member = relationship("Member", back_populates="payments")

class Expense(Base):
    __tablename__ = "expenses"

    expense_id = Column(Integer, primary_key=True, index=True)
    category = Column(String)
    amount_cents = Column(Integer)
    currency = Column(String)
    booked_at = Column(Date)
    project = Column(String)
    memo = Column(Text)

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String)
    budget_cents = Column(Integer)
    start_date = Column(Date)
    end_date = Column(Date)
