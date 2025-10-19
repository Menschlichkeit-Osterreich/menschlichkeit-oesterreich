from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional, List

class PaymentBase(BaseModel):
    source: Optional[str] = None
    external_id: Optional[str] = None
    payer_type: Optional[str] = None
    amount_cents: int
    currency: str
    method: Optional[str] = None
    is_recurring: Optional[bool] = None
    booked_at: datetime
    campaign: Optional[str] = None

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    payment_id: int
    member_id: Optional[int] = None

    class Config:
        orm_mode = True

class MemberBase(BaseModel):
    external_id: Optional[str] = None
    status: Optional[str] = None
    joined_at: Optional[date] = None
    cancelled_at: Optional[date] = None
    fee_plan: Optional[str] = None
    consent_dsgvo: Optional[bool] = None
    consent_ts: Optional[datetime] = None

class MemberCreate(MemberBase):
    pass

class Member(MemberBase):
    member_id: int
    payments: List[Payment] = []

    class Config:
        orm_mode = True
