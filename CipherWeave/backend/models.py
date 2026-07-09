from sqlalchemy import Boolean, Column, Float, Integer, String, DateTime
from database import Base
import datetime

class CyberEvent(Base):
    __tablename__ = "cyber_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    entity_id = Column(String, index=True)
    event_type = Column(String)
    source_ip = Column(String)
    geo = Column(String)
    device_id = Column(String)
    severity = Column(Integer)
    cipher_suite = Column(String, nullable=True) # E.g., 'TLS_RSA_WITH_AES_128_CBC_SHA'

class TransactionEvent(Base):
    __tablename__ = "transaction_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    entity_id = Column(String, index=True)
    transaction_type = Column(String)
    amount = Column(Float)
    beneficiary = Column(String)
    channel = Column(String)
    geo = Column(String)

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    entity_id = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    risk_score = Column(Float)
    quantum_risk = Column(Boolean, default=False)
    status = Column(String, default="new") # new, escalated, dismissed
    explanation = Column(String)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, index=True)
    action = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
