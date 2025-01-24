Create `.env` file under `src\api`

Create Python virtual environment
```
cd src/api
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Run app:

`python -m uvicorn app.main:app --env-file .env --log-level debug`



