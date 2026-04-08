# GitHub Setup Guide — Making the Repository Private

This guide walks through setting up your GitHub repository as private and configuring access.

---

## Making the Repository Private

### Step 1: Go to Repository Settings

1. Navigate to https://github.com/natebutlerexplains-droid/JobAppCRM
2. Click **Settings** (gear icon, top right)
3. Scroll down to **Danger Zone** section

### Step 2: Change Visibility to Private

1. In "Danger Zone", click **Change visibility**
2. Select **Private**
3. Read the warning (public GitHub Pages will become private)
4. Type the repository name: `JobAppCRM`
5. Click **I understand, change repository visibility to private**

The repository is now **private**. Only you and people you invite can see it.

---

## Setting Up Access for Collaborators

If you want to invite developers (e.g., Codex contractor, friends), follow these steps.

### Add a Collaborator via GitHub Web

1. Go to **Settings** → **Collaborators and teams**
2. Click **Add people**
3. Type GitHub username and select them
4. Choose permission level:
   - **Read** — View only, no commits
   - **Triage** — Can manage issues/PRs but can't merge
   - **Write** — Full commit access (recommended for active developers)
   - **Maintain** — Can manage settings and deploy
   - **Admin** — Full control
5. Click **Add {username} to JobAppCRM**

---

## GitHub Actions & Deployment

Since the repo is now private, GitHub Actions workflows can still run:

### CI/CD Recommendations

Create `.github/workflows/test.yml` to:
- Run backend tests on push (`pytest tests/`)
- Run frontend tests on push (`npm run test`)
- Lint code (flake8, prettier)

**Example:**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: pytest tests/ -v
  
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install && npm run test
```

---

## Protecting Branches

Protect `main` branch from accidental force-pushes:

1. Go to **Settings** → **Branches**
2. Click **Add rule** under "Branch protection rules"
3. Branch name pattern: `main`
4. Enable:
   - ✓ Require pull request reviews before merging
   - ✓ Require status checks to pass
   - ✓ Require branches to be up to date
5. Click **Create**

---

## Secrets & Environment Variables

Since you're using API keys (MS Graph, Gemini), **never commit `.env` to GitHub**.

### GitHub Secrets (for CI/CD)

If you add GitHub Actions, store secrets securely:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add secrets:
   - `MS_GRAPH_CLIENT_ID`
   - `MS_GRAPH_CLIENT_SECRET`
   - `GEMINI_API_KEY`
   - etc.
4. Reference in workflows: `${{ secrets.MS_GRAPH_CLIENT_ID }}`

**`.env` will never be committed** (it's in `.gitignore`), so this is optional for local development.

---

## Checking Private Status

Verify the repository is private:

```bash
# Command line check
gh repo view natebutlerexplains-droid/JobAppCRM

# Should show: visibility: PRIVATE
```

Or simply visit https://github.com/natebutlerexplains-droid/JobAppCRM — if you see "This repository is private" and no "Star", "Fork" buttons for anonymous users, it's correctly set to private.

---

## Pushing Your Code

Push all local commits to GitHub:

```bash
git push -u origin main
```

After making the repo private, **first push takes a moment** as GitHub reindexes everything.

---

## Future: Public Release?

If you ever want to make the repo public:

1. **Sanitize secrets:** Search for hardcoded API keys, passwords (there shouldn't be any if `.env` is in `.gitignore`)
2. **Clean up sensitive issues:** Go through issue tracker and close/delete anything confidential
3. **Repeat Step 1–2 from above, but select "Public"**

---

## Recommended Settings for Private Repo

| Setting | Recommendation |
|---------|-----------------|
| Branch protection | Enable on `main` |
| Require reviews | 1 review before merge |
| Dismissable reviews | No (enforce quality) |
| Require status checks | Yes (if CI/CD added) |
| Auto-delete head branches | Yes (clean up old branches) |
| Require linear history | No (allow merges) |
| Allow force pushes | No (prevent accidents) |

---

## Troubleshooting

### "You don't have permission to change the repository visibility"

**Cause:** You're not the repository owner.

**Solution:** Ask the owner to change it, or contact GitHub support.

### "Repository is still showing in search"

**Cause:** GitHub's search index hasn't updated yet.

**Solution:** Wait 15–30 minutes. If still visible after an hour, contact GitHub support.

### "Collaborators can't clone the repo"

**Cause:** They don't have access, or SSH keys aren't configured.

**Solution:**
```bash
# Make sure collaborator is invited (see "Add a Collaborator" above)
# Make sure they have SSH key set up:
ssh -T git@github.com

# If key isn't found, generate one:
ssh-keygen -t ed25519 -C "your_email@example.com"
# Then add to https://github.com/settings/keys
```

---

## Summary

✅ **Repository is now private**
- Only you and invited collaborators can see it
- API keys won't be exposed
- You can safely push code

✅ **Best practices in place**
- `.env` ignored (never committed)
- Collaborators can be added per-task
- Branch protection prevents accidents
- CI/CD can be added later

---

For questions, see [CONTRIBUTING.md](../CONTRIBUTING.md) or [CLAUDE.md](../CLAUDE.md).

