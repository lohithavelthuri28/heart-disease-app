# heart-disease-app
Heart Disease Prediction – Backend + Optional Frontend UI

This project implements a machine-learning powered heart disease prediction system.

It includes:

✔ backend/ — the required part for the assignment

FastAPI + scikit-learn model training & prediction API.

✔ frontend/ — optional (bonus) React UI

Not required for model-training task, added for demo purposes.

📁 Project Structure
heart-disease-app/
│
├── backend/                      # REQUIRED (core assignment)
│   ├── app.py                    # FastAPI ML API (POST /predict)
│   ├── train.py                  # Model training script
│   ├── requirements.txt          # Python dependencies
│   ├── data/
│   │   └── heart.csv             # Dataset (or sample)
│   ├── models/
│   │   └── model.joblib          # Saved trained model
│   └── Dockerfile                # (Optional)
│
├── frontend/                     # OPTIONAL (demo UI)
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── App.js
│       ├── api.js
│       └── PredictionForm.js
│
├── .gitignore
└── README.md

🔥 Backend Overview (REQUIRED PART)
📘 train.py

Loads dataset (data/heart.csv)

Trains scikit-learn model with proper feature order

Saves trained model → models/model.joblib

📘 app.py

FastAPI app exposing:

GET /health

Check API + model availability.

POST /predict

Input example:

{
  "features": {
    "age": 63,
    "sex": 1,
    "chest pain type": 3,
    "resting bp s": 145,
    "cholesterol": 233,
    "fasting blood sugar": 1,
    "resting ecg": 0,
    "max heart rate": 150,
    "exercise angina": 0,
    "oldpeak": 2.3,
    "ST slope": 1
  }
}


Output example:

{
  "prediction": 1,
  "label": "Heart disease",
  "confidence": 0.545
}


Swagger API Docs →
👉 http://127.0.0.1:8000/docs

▶️ How to Run Backend
1. Create & activate environment
cd backend
python -m venv .venv
.\.venv\Scripts\activate

2. Install dependencies
pip install -r requirements.txt

3. Train model (if model.joblib not provided)
python train.py

4. Run server
python -m uvicorn app:app --reload --port 8000


API now running at:
👉 http://127.0.0.1:8000

Swagger docs:
👉 http://127.0.0.1:8000/docs

🎨 Frontend (Optional Demo UI)
1. Move to frontend
cd frontend

2. Install dependencies
npm install

3. Start dev server
npm start


Frontend runs at:
👉 http://localhost:3000

📝 Notes for Reviewers

Only the backend is required for the assignment.
The frontend is included as a demonstration of how the trained model can be deployed in a real application.

📄 License

MIT / Any license you choose.
