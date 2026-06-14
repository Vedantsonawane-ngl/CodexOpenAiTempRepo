# intelliSOC Frontend

React + Tailwind frontend for the Agentic SOC / intelliSOC security investigation platform.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Backend Connection

By default the frontend tries to call:

```text
http://127.0.0.1:8000
```

You can override it with:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

If the backend is not running, the UI falls back to mock data so the full interface remains visible.

Start the backend from the repository root with:

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
