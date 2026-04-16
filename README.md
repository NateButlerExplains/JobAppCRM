# Job Application CRM

> A simple, fully local job application tracker for managing your job search pipeline with a Kanban board and manual interaction logging.

**⚡ No external hosting required. Everything runs on your machine.**

![GitHub](https://img.shields.io/badge/repo-private-lightgrey) ![Python](https://img.shields.io/badge/python-3.11+-blue) ![React](https://img.shields.io/badge/react-18+-cyan) ![SQLite](https://img.shields.io/badge/sqlite-WAL-green)

---

## ✨ Features

- 🎯 **Pipeline Tracking** — Drag-and-drop kanban board with five stages: Submitted → More Info Required → Interview Started → Denied / Offered
- 📝 **Manual Entry** — Create applications with company name, job title, applied date, and job URL
- 📋 **Interaction Log** — Record notes, phone calls, and follow-ups for each application
- 📊 **Application Stats** — Overview of how many applications are in each pipeline stage
- 🔐 **Fully Private** — All data stays on your machine; no external cloud dependencies
- 💾 **Automatic Persistence** — SQLite database saves all changes locally

## 🛠 Tech Stack

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Backend** | Python 3.11 + Flask | Simple RESTful API |
| **Database** | SQLite with WAL mode | No external DB needed |
| **Frontend** | React 18 + Vite | Fast dev experience |
| **UI Framework** | shadcn/ui + Tailwind CSS | Beautiful, accessible components |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- npm 8+

### Automatic Setup (Recommended)
```bash
./setup.sh
```

This will:
1. Check for required software
2. Create `.env` file
3. Set up Python virtual environment and install dependencies
4. Initialize SQLite database
5. Install Node.js dependencies

### Manual Setup

```bash
# Create environment file
cp .env.example .env

# Python setup
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# or: venv\Scripts\activate  # Windows
pip install -r backend/requirements.txt
python3 backend/models.py  # Initialize database

# Node setup
cd frontend
npm install
cd ..

# Create logs directory
mkdir -p logs
```

## Running the App

### Terminal 1 (Backend - port 5000)
```bash
source venv/bin/activate  # Activate virtual environment
python -m flask --app backend.app run --port 5000
```

You should see:
```
Running on http://127.0.0.1:5000
```

### Terminal 2 (Frontend - port 3000)
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.4.21  ready in xxx ms

➜  Local:   http://localhost:3000/
```

Then **open http://localhost:3000 in your browser**.

## How It Works

### Kanban Board (Dashboard)

The main view shows your applications in a 5-column kanban:
- **Submitted** — Applications you've just sent
- **More Info Required** — Waiting on additional info from you
- **Interview Started** — In active interview process
- **Denied** — Rejection received
- **Offered** — Offer received

**Drag and drop** cards between columns to update status. Changes sync to the backend immediately.

### Create an Application

Click **"+ New Application"** in the header to open the form. Fill in:
- Company name
- Job title
- Date applied
- (Optional) Job URL
- (Optional) Company domain

The new application appears in the Submitted column automatically.

### Application Details

Click any card to open the detail panel. You'll see:
- **Company and role name** at the top
- **Applied date and current status**
- **Interactions tab** — All notes, calls, follow-ups in chronological order
- **Add Interaction button** — Record a note, phone call, or text message

## Database Schema

4 tables (SQLite with WAL mode for concurrent access):
- **applications** — Job applications with status
- **emails** — (Optional) Linked emails or forwarded content
- **interactions** — Phone calls, texts, manual notes
- **stage_suggestions** — Placeholder for future AI suggestions

See `backend/models.py` for the full schema.

## API Endpoints

### Applications
- `GET /api/applications` — List all applications
- `POST /api/applications` — Create new application
- `GET /api/applications/<id>` — Get specific application
- `PATCH /api/applications/<id>` — Update application (e.g., change status)
- `DELETE /api/applications/<id>` — Delete application

### Interactions
- `GET /api/applications/<id>/interactions` — List interactions for an application
- `POST /api/applications/<id>/interactions` — Add interaction (note, call, text)

### Stats
- `GET /api/stats` — Get counts by status (Submitted, Interview Started, etc.)

## 🔧 Troubleshooting

### Setup Issues

#### "No module named 'models'" or Import errors
**Solution:** Ensure virtual environment is activated and dependencies are installed.
```bash
source venv/bin/activate  # or: venv\Scripts\activate on Windows
pip install -r backend/requirements.txt
python3 -c "import models" # Test import
```

#### "Connection refused" (can't reach localhost:5000 or 3000)
**Cause:** Port is already in use or service didn't start.
```bash
# Check what's using the port
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Either kill the process or use a different port
python -m flask --app backend.app run --port 5001
```

#### "ModuleNotFoundError: No module named 'flask'"
**Solution:** Reinstall dependencies:
```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### Database Issues

#### "Database is locked" or SQLite corruption
**Solution:** Reset the database by removing WAL files:
```bash
rm jobs.db jobs.db-wal jobs.db-shm
python3 backend/models.py  # Recreate empty DB
```

### Frontend Issues

#### CSS not loading or components unstyled
**Solution:** Vite dev server not running or build assets corrupted:
```bash
cd frontend
npm run dev  # Restart dev server
```

#### "Cannot POST /api/..." (API calls failing)
**Debug:** Check that backend is running on the correct port:
```bash
curl http://localhost:5000/health  # Backend healthcheck
```

If it fails, restart the backend and check the terminal for errors.

## File Structure

```
JobAppCRM/
├── backend/
│   ├── app.py                 # Flask API
│   ├── models.py              # SQLite schema + ORM methods
│   ├── config.py              # Configuration + logging
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app
│   │   ├── KanbanBoard.jsx    # Drag-and-drop board
│   │   ├── ApplicationCard.jsx # Card component
│   │   ├── CardDetail.jsx     # Detail panel
│   │   ├── AddInteraction.jsx # Add interaction modal
│   │   ├── NewApplicationForm.jsx # New app form
│   │   ├── Settings.jsx       # Settings / info page
│   │   └── api.js             # API client
│   └── package.json           # Node dependencies
├── tests/                     # Backend test suite
├── setup.sh                   # One-command setup
├── CLAUDE.md                  # Dev team documentation
└── README.md                  # This file
```

## Performance Notes

- **SQLite WAL mode** enables concurrent reads while writes happen
- **Optimistic UI updates** in kanban for instant feedback
- **Automatic revert** if network errors occur

## Contributing

This project uses an **autonomous agent architecture** for development:

1. **PM Review** — Check project health and recommend work
   ```bash
   /pm review current state
   ```

2. **Dev Execution** — Work on specific tasks autonomously
   ```bash
   /dev TASK-001
   ```

3. **CEO Approval** — Make strategic decisions and approve work

See [CLAUDE.md](CLAUDE.md) for the full role structure and workflow.

## License

Personal project — use as you like.

## Support

Check the Troubleshooting section above, or review the console logs in `logs/` directory.

---

**Happy job hunting!** 🚀
