
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
import time

from database import engine, Base, get_db
import models
from generator import generate_synthetic_data
from engine import process_and_correlate
from pydantic import BaseModel
from auth import get_current_user, create_access_token, verify_password, get_password_hash

# Try creating tables with retries for postgres readiness
for i in range(10):
    try:
        Base.metadata.create_all(bind=engine)
        break
    except OperationalError as e:
        if i == 9:
            raise e
        print("Database not ready yet, retrying in 2 seconds...")
        time.sleep(2)

app = FastAPI(title="CipherWeave API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def seed_admin_user():
    db = next(get_db())
    try:
        admin_exists = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_exists:
            print("Seeding default admin user...")
            hashed_pwd = get_password_hash("admin")
            db_admin = models.User(username="admin", hashed_password=hashed_pwd)
            db.add(db_admin)
            db.commit()
            print("Default admin user created successfully.")
    except Exception as e:
        print(f"Error seeding admin user: {e}")
    finally:
        db.close()

# Authentication endpoints
@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    
    if not user or not user.hashed_password:
        # Hash a dummy password to equalize response time and prevent timing attacks
        get_password_hash(form_data.password)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer", "username": user.username}

@app.get("/users/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {"username": current_user.username}

# Protected telemetry & simulation endpoints
@app.post("/simulate")
def simulate(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    res = generate_synthetic_data(db)
    process_and_correlate(db)
    return {"status": "success", "message": "Synthetic data generated and correlated."}

@app.get("/cases")
def get_cases(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    cases = db.query(models.Case).order_by(models.Case.risk_score.desc()).all()
    return cases

@app.get("/cases/{case_id}")
def get_case(case_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    cyber_events = db.query(models.CyberEvent).filter(models.CyberEvent.entity_id == case.entity_id).order_by(models.CyberEvent.timestamp).all()
    txn_events = db.query(models.TransactionEvent).filter(models.TransactionEvent.entity_id == case.entity_id).order_by(models.TransactionEvent.timestamp).all()
    
    return {
        "case": case,
        "cyber_events": cyber_events,
        "transaction_events": txn_events
    }

@app.get("/stats")
def get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    cases = db.query(models.Case).all()
    total_cases = len(cases)
    high_risk_cases = len([c for c in cases if c.risk_score > 70])
    quantum_threats = len([c for c in cases if c.quantum_risk])
    escalated_cases = len([c for c in cases if c.status == "escalate" or c.status == "escalated"])
    
    return {
        "total_cases": total_cases,
        "high_risk_cases": high_risk_cases,
        "quantum_threats": quantum_threats,
        "escalated_cases": escalated_cases
    }

class ActionRequest(BaseModel):
    action: str # 'escalate', 'dismiss', 'false_positive'

@app.post("/cases/{case_id}/action")
def take_action(case_id: int, req: ActionRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    valid_actions = {
        "escalate": "escalated",
        "dismiss": "dismissed",
        "false_positive": "false_positive"
    }
    
    if req.action not in valid_actions:
        raise HTTPException(status_code=400, detail="Invalid action")
        
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    case.status = valid_actions[req.action]
    feedback = models.Feedback(case_id=case_id, action=req.action)
    db.add(feedback)
    db.commit()
    
    return {"status": "success", "action_recorded": req.action, "new_status": case.status}
