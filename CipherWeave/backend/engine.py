import networkx as nx
import pandas as pd
from sklearn.ensemble import IsolationForest
import numpy as np
from sqlalchemy.orm import Session
from models import CyberEvent, TransactionEvent, Case
from datetime import timedelta

# Fallback feature attribution if SHAP is too complex for hackathon setup
def explain_anomaly(features, feature_names):
    # Simplified mock attribution based on value extremity
    contributions = []
    if features['time_diff_minutes'] < 15:
        contributions.append(("short time window between login and transaction", 0.4))
    if features['amount_z_score'] > 2.0:
        contributions.append(("wire transfer unusually large", 0.35))
    if features['has_unusual_geo']:
        contributions.append(("login from an unrecognized or high-risk country", 0.42))
    
    if not contributions:
        return "Flagged due to unusual combination of events."
    
    # Sort and format
    contributions.sort(key=lambda x: x[1], reverse=True)
    explanation_parts = [f"{desc} (weight {weight})" for desc, weight in contributions[:3]]
    return f"Flagged because: {', '.join(explanation_parts)}."

def process_and_correlate(db: Session):
    cyber_events = db.query(CyberEvent).all()
    txn_events = db.query(TransactionEvent).all()

    # Build Graph for entity resolution
    G = nx.Graph()
    
    # Add nodes and edges based on entity_id
    for ce in cyber_events:
        G.add_node(f"C_{ce.id}", type='cyber', data=ce)
        G.add_node(ce.entity_id, type='entity')
        G.add_edge(f"C_{ce.id}", ce.entity_id)

    for te in txn_events:
        G.add_node(f"T_{te.id}", type='txn', data=te)
        G.add_node(te.entity_id, type='entity')
        G.add_edge(f"T_{te.id}", te.entity_id)

    cases_data = []
    
    # Process each entity's subgraph
    entities = [n for n, attr in G.nodes(data=True) if attr.get('type') == 'entity']
    for entity_id in entities:
        neighbors = list(G.neighbors(entity_id))
        if not neighbors:
            continue
            
        c_events = [G.nodes[n]['data'] for n in neighbors if G.nodes[n]['type'] == 'cyber']
        t_events = [G.nodes[n]['data'] for n in neighbors if G.nodes[n]['type'] == 'txn']
        
        # We need at least some activity to form a case
        if not c_events and not t_events:
            continue

        c_events.sort(key=lambda x: x.timestamp)
        t_events.sort(key=lambda x: x.timestamp)

        # Feature Engineering for Isolation Forest
        has_unusual_geo = any(c.event_type == 'unusual_geo_login' for c in c_events)
        max_txn_amount = max([t.amount for t in t_events]) if t_events else 0
        
        # Calculate time diff between last cyber and first txn
        time_diff = 9999
        if c_events and t_events:
            diff = (t_events[0].timestamp - c_events[-1].timestamp).total_seconds() / 60.0
            if diff > 0:
                time_diff = diff

        amount_z_score = 0
        if max_txn_amount > 10000:
            amount_z_score = 3.0 # Dummy z-score logic for prototype
        elif max_txn_amount > 1000:
            amount_z_score = 1.0

        # Quantum Risk Logic
        quantum_risk = False
        for c in c_events:
            if c.event_type == 'large_data_transfer' and c.cipher_suite == 'TLS_RSA_WITH_AES_128_CBC_SHA':
                quantum_risk = True
                break

        cases_data.append({
            'entity_id': entity_id,
            'has_unusual_geo': int(has_unusual_geo),
            'max_txn_amount': max_txn_amount,
            'time_diff_minutes': time_diff,
            'amount_z_score': amount_z_score,
            'quantum_risk': quantum_risk
        })

    if not cases_data:
        return

    # Run Isolation Forest
    df = pd.DataFrame(cases_data)
    features = ['has_unusual_geo', 'amount_z_score', 'time_diff_minutes']
    X = df[features].fillna(0)
    
    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(X)
    
    # -1 for anomaly, 1 for normal. Convert to 0-100 risk score
    scores = clf.decision_function(X) # lower is more anomalous
    normalized_scores = 100 * (1 - (scores - scores.min()) / (scores.max() - scores.min() + 1e-10))
    
    df['risk_score'] = normalized_scores

    # Save cases to DB
    for _, row in df.iterrows():
        # Only save cases that are somewhat anomalous or have quantum risk to avoid clutter
        if row['risk_score'] > 30 or row['quantum_risk']:
            explanation = explain_anomaly(row.to_dict(), features)
            case = Case(
                entity_id=row['entity_id'],
                risk_score=row['risk_score'],
                quantum_risk=bool(row['quantum_risk']),
                status="new",
                explanation=explanation
            )
            db.add(case)
    
    db.commit()
