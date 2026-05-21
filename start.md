Use two terminals.

Backend

 python3.12 -m venv .venv
 . .venv/bin/activate
 python -m pip install --upgrade pip
 pip install -r requirements.txt
 cp .env.example .env
 cd backend
 python manage.py migrate
 python manage.py runserver

Frontend

 cd frontend
 npm install
 cp .env.example .env.local
 npm run dev

After that, the backend runs on Django’s default local server and the frontend runs on Vite’s local dev server.

Use Python 3.11+ for the backend. If your default `python` or `python3` is 3.9, switch to `python3.12` (or another 3.11+ interpreter) before creating the virtualenv.
