Use two terminals.

Backend

 python3 -m venv .venv
 . .venv/bin/activate
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
