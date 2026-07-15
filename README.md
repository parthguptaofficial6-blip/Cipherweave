# CipherWeave

CipherWeave is a comprehensive threat intelligence and fraud detection platform. It works by generating, processing, and correlating synthetic cyber events and transaction events to identify high-risk activities. The system provides an interactive dashboard for analysts to review cases, inspect correlated events, and take appropriate actions (escalate, dismiss, or flag as false positives).

## Tech Stack

**Frontend:**
- React (18.2)
- Vite
- Tailwind CSS
- Lucide React (for icons)

**Backend:**
- Python / FastAPI
- SQLAlchemy (SQLite database by default)
- Uvicorn

## Features

- **Synthetic Data Generation:** Simulate realistic transaction and cyber events.
- **Correlation Engine:** Automatically correlate cyber anomalies with financial transactions to generate risk-scored cases.
- **Case Management:** View high-risk cases, inspect underlying events, and take action (escalate, dismiss, mark as false positive).
- **Authentication:** Secure API endpoints with JWT-based authentication.

## Getting Started

### Prerequisites

- Node.js & npm
- Python 3.8+

### 1. Backend Setup

Navigate to the backend directory and set up a virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI server:

```bash
uvicorn main:app --reload
```
*Note: A default admin user (`admin` / `admin`) is automatically seeded into the database upon startup.*

### 2. Frontend Setup

In a new terminal window, navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port specified by Vite).

## Usage

1. Log in to the frontend dashboard using the default credentials.
2. Trigger the "Simulate" functionality to generate synthetic data and correlate events.
3. Review the generated cases, expand them to see the correlated cyber and transaction events, and resolve them.
