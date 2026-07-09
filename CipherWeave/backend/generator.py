import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import CyberEvent, TransactionEvent, Case, Feedback

EVENT_TYPES = ["login", "failed_login", "vpn_connect", "privilege_escalation", "unusual_geo_login", "malware_alert", "large_data_transfer"]
TRANSACTION_TYPES = ["NEFT", "RTGS", "UPI", "card_swipe", "wire_transfer"]
CHANNELS = ["mobile", "web", "branch", "atm"]
CIPHER_SUITES = ["TLS_AES_256_GCM_SHA384", "TLS_CHACHA20_POLY1305_SHA256", "TLS_RSA_WITH_AES_128_CBC_SHA", "TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA"]
WEAK_CIPHERS = ["TLS_RSA_WITH_AES_128_CBC_SHA"]

def generate_ip():
    return f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"

def generate_geo():
    return random.choice(["US", "UK", "IN", "SG", "AU", "RU", "CN", "KP"])

def generate_synthetic_data(db: Session, num_entities=50):
    # Clear existing data for simplicity in this demo
    db.query(CyberEvent).delete()
    db.query(TransactionEvent).delete()
    db.query(Case).delete()
    db.query(Feedback).delete()
    db.commit()

    base_time = datetime.utcnow() - timedelta(days=1)

    for i in range(num_entities):
        entity_id = f"CUST_{1000 + i}"
        device_id = str(uuid.uuid4())
        
        scenario = random.choices(["benign", "fraud", "quantum"], weights=[0.8, 0.1, 0.1])[0]

        if scenario == "benign":
            # 1-3 cyber events, 1-3 transactions
            for j in range(random.randint(1, 3)):
                time_offset = timedelta(minutes=random.randint(0, 120))
                cyber = CyberEvent(
                    timestamp=base_time + time_offset,
                    entity_id=entity_id,
                    event_type=random.choice(["login", "vpn_connect"]),
                    source_ip=generate_ip(),
                    geo=random.choice(["US", "UK", "IN"]),
                    device_id=device_id,
                    severity=1,
                    cipher_suite=random.choice(["TLS_AES_256_GCM_SHA384", "TLS_CHACHA20_POLY1305_SHA256"])
                )
                db.add(cyber)
            
            for j in range(random.randint(1, 3)):
                time_offset = timedelta(minutes=random.randint(30, 240))
                txn = TransactionEvent(
                    timestamp=base_time + time_offset,
                    entity_id=entity_id,
                    transaction_type=random.choice(["UPI", "card_swipe", "NEFT"]),
                    amount=round(random.uniform(10.0, 500.0), 2),
                    beneficiary=f"BENEF_{random.randint(100, 999)}",
                    channel=random.choice(["mobile", "web"]),
                    geo=random.choice(["US", "UK", "IN"])
                )
                db.add(txn)

        elif scenario == "fraud":
            # Account takeover + large wire transfer within short timeframe
            time_offset = timedelta(minutes=random.randint(0, 60))
            cyber = CyberEvent(
                timestamp=base_time + time_offset,
                entity_id=entity_id,
                event_type="unusual_geo_login",
                source_ip=generate_ip(),
                geo=random.choice(["RU", "KP"]),
                device_id=device_id,
                severity=8,
                cipher_suite="TLS_AES_256_GCM_SHA384"
            )
            db.add(cyber)

            txn = TransactionEvent(
                timestamp=base_time + time_offset + timedelta(minutes=random.randint(2, 10)),
                entity_id=entity_id,
                transaction_type="wire_transfer",
                amount=round(random.uniform(50000.0, 250000.0), 2),
                beneficiary="OFFSHORE_ACC_999",
                channel="web",
                geo=random.choice(["RU", "KP"])
            )
            db.add(txn)

        elif scenario == "quantum":
            # Harvest-now-decrypt-later: large data transfer + weak cipher
            time_offset = timedelta(minutes=random.randint(0, 120))
            cyber = CyberEvent(
                timestamp=base_time + time_offset,
                entity_id=entity_id,
                event_type="large_data_transfer",
                source_ip=generate_ip(),
                geo=generate_geo(),
                device_id=device_id,
                severity=6,
                cipher_suite="TLS_RSA_WITH_AES_128_CBC_SHA"
            )
            db.add(cyber)

            # Maybe a small transaction, or nothing
            if random.random() > 0.5:
                txn = TransactionEvent(
                    timestamp=base_time + time_offset + timedelta(minutes=random.randint(60, 300)),
                    entity_id=entity_id,
                    transaction_type="card_swipe",
                    amount=round(random.uniform(5.0, 50.0), 2),
                    beneficiary="LOCAL_CAFE",
                    channel="atm",
                    geo=cyber.geo
                )
                db.add(txn)

    db.commit()
    return {"message": f"Generated data for {num_entities} entities"}
