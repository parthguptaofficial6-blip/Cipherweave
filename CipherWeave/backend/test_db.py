import sys
sys.path.append('/Users/parthgupta/Downloads/FIN Project/CipherWeave/backend')
from database import SessionLocal
import models
db = SessionLocal()
try:
    print(type(models.Case.risk_score))
    cases = db.query(models.Case).order_by(models.Case.risk_score.desc()).all()
    print("Success!")
except Exception as e:
    import traceback
    traceback.print_exc()
