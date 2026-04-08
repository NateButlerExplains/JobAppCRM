# Job Application CRM

A personal, fully local job application tracking system that automatically syncs emails from Outlook, classifies them with AI, and suggests pipeline stage changes.

**No external hosting required. Everything runs on your machine.**

## Features

- 📧 **Auto-linking Emails** — Syncs emails from Outlook and automatically links them to job applications based on domain, keywords, and AI classification
- 🤖 **AI Classification** — Uses Google Gemini to classify emails (application confirmation, interview request, rejection, etc.)
- 🎯 **Pipeline Tracking** — Drag-and-drop kanban board with statuses: Submitted, More Info Required, Interview Started, Denied, Offered
- 💡 **Smart Suggestions** — AI suggests stage changes based on email content
- 🔄 **Automatic Syncing** — Runs daily at 2 AM + on-demand sync
- 📊 **Unlinked Email Tray** — Searchable tray for emails that couldn't be auto-linked

## Tech Stack

- **Backend:** Python 3.11 + Flask
- **Database:** SQLite with WAL mode (concurrent access support)
- **Frontend:** React + Vite + shadcn/ui + Tailwind CSS
- **Email:** Microsoft Graph API (personal accounts, OAuth2 PKCE)
- **AI:** Google Gemini API (free tier, `gemini-1.5-flash`)
- **Scheduler:** APScheduler (daily + startup sync)

## Quick Setup

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
6. Guide you through API key setup

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

## Getting API Keys

### 1. Microsoft Graph API (for Outlook)

**Steps:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Azure Active Directory" → "App registrations" → "New registration"
3. Name it "Job CRM"
4. Under "Supported account types", select **"Accounts in any organizational directory and personal Microsoft accounts"**
5. Set Redirect URI to `http://localhost:5000/auth/callback`
6. Go to "Certificates & secrets" → "New client secret"
7. Copy the **Client ID** and **Client Secret**
8. Add to `.env`:
   ```
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   ```

### 2. Google Gemini API (for AI classification)

**Steps:**
1. Go to [ai.google.dev](https://ai.google.dev)
2. Click "Get API Key"
3. Create a new API key
4. Copy it and add to `.env`:
   ```
   GEMINI_API_KEY=your_api_key
   ```

## Running the App

### Terminal 1 (Backend - port 5000)
```bash
source venv/bin/activate  # Activate virtual environment
cd backend
python app.py
```

You should see:
```
Running on http://127.0.0.1:5000
APScheduler initialized with daily 2 AM sync job
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

### Email Syncing

**Daily at 2 AM (or manually via Settings → Run Sync Now):**
1. Fetch last 7 days of emails from your Outlook inbox
2. For each email, classify with Gemini AI
3. Link to applications based on:
   - **Domain match** (0.9 confidence) — email domain matches company domain
   - **Keyword match** (0.7 confidence) — company name or keywords in subject/body
   - **Semantic match** (variable) — AI-powered similarity
4. Ambiguous matches go to **Unlinked Emails Tray** for manual linking

### Unlinked Emails Tray

At the bottom of the dashboard, you'll see unlinked emails. Click to search for an application and assign the email. The email will then appear in the application's detail panel.

### Application Details

Click any card to open the detail panel. You'll see:
- **Emails tab** — All emails linked to this application
- **Interactions tab** — Phone calls, texts, notes (chronologically ordered)
- **Add Note tab** — Record interactions (calls, texts, manual notes)

## Architecture

The system uses a **three-role multi-agent architecture** for maintenance and development. See [CLAUDE.md](CLAUDE.md) for details on:
- **PM Mode** — Project management and health reviews
- **Dev Mode** — Autonomous task execution
- **CEO Mode** — Strategic decisions and oversight

## Database Schema

6 tables (SQLite with WAL mode for concurrent access):
- **applications** — Job applications with status
- **emails** — Synced emails with classification and linking
- **interactions** — Phone calls, texts, manual notes
- **stage_suggestions** — AI suggestions for status changes
- **processed_emails** — Dedup tracking (prevent re-processing)
- **sync_logs** — History of sync runs

See `backend/models.py` for the full schema.

## Troubleshooting

### "No module named 'models'"
Make sure you're running from the correct directory and have activated the virtual environment.
```bash
source venv/bin/activate
python3 backend/models.py  # Test import
```

### "Connection refused" (port 5000 or 3000)
Another process is using the port. Either:
- Kill the process: `lsof -i :5000` then `kill -9 <PID>`
- Use a different port: Set `FLASK_PORT=5001` in `.env`

### "Failed to authenticate with Microsoft"
1. Double-check your Client ID and Client Secret in `.env`
2. Verify the redirect URI in Azure is set to `http://localhost:5000/auth/callback`
3. Make sure you selected **personal Microsoft accounts** during app registration

### "API rate limit exceeded"
Gemini has a free tier limit. If you hit it, wait ~5 minutes before syncing again, or add your billing info to increase limits.

### Database locked error
The SQLite WAL (Write-Ahead Logging) system can deadlock. Delete the `-wal` and `-shm` files:
```bash
rm jobs.db-wal jobs.db-shm
```

## File Structure

```
JobAppCRM/
├── backend/
│   ├── app.py                 # Flask API + scheduler
│   ├── models.py              # SQLite schema + ORM methods
│   ├── auth.py                # Microsoft OAuth2 PKCE
│   ├── email_processor.py     # Email fetch/sync pipeline
│   ├── gemini_classifier.py   # Email classification
│   ├── application_linker.py  # Email-to-app matching
│   ├── config.py              # Configuration + logging
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app + routing
│   │   ├── KanbanBoard.jsx    # Drag-and-drop board
│   │   ├── ApplicationCard.jsx # Card component
│   │   ├── CardDetail.jsx     # Detail panel
│   │   ├── AddInteraction.jsx # Add interaction modal
│   │   ├── NewApplicationForm.jsx # New app form
│   │   ├── UnlinkedEmailsTray.jsx # Unlinked emails panel
│   │   ├── Settings.jsx       # Sync management
│   │   └── api.js             # API client
│   └── package.json           # Node dependencies
├── tests/                     # Backend test suite
├── setup.sh                   # One-command setup
├── CLAUDE.md                  # Dev team documentation
└── README.md                  # This file
```

## Performance Notes

- **SQLite WAL mode** enables concurrent reads while writes happen
- **Rate limiter** (1 req/sec) on Gemini API to stay within free tier
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
