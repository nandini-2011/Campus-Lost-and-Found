# Campus Lost & Found

A student-focused web app for reporting and finding lost or found items on campus.

## Stack
- React + Vite frontend
- Python Flask REST API
- SQLite by default (easy local setup); can be changed to MySQL later

## Features
- Browse lost and found reports
- Search by item name, description or location
- Filter by Lost / Found
- Submit a report with contact details
- Mark a report as resolved

## Run locally

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\\Scripts\\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```
API runs at http://127.0.0.1:5000.

### Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite.

## Notes
This is a starter project. Test it locally before presenting it as a completed deployment. For production, add authentication, input validation, CSRF protection, image upload storage, rate limiting and a production database.
